// server/controllers/speech.controller.js

const { SpeechClient } = require('@google-cloud/speech');
const AnalysisReport = require('../models/AnalysisReport.model');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const path = require('path');

// Initialize Google Speech Client with credentials
// The GOOGLE_APPLICATION_CREDENTIALS env var should point to your JSON key file
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../google-credentials.json')
});

// --- Paste all the calculation helper functions here ---

function calculatePace(words) {
  if (!words || words.length === 0) {
    return { wordsPerMinute: 0, status: 'N/A' };
  }

  // Get the start time of the first word and end time of the last word.
  const startTime = words[0].startTime.seconds;
  const endTime = words[words.length - 1].endTime.seconds;

  // Calculate the total duration in minutes.
  const totalDurationMinutes = (endTime - startTime) / 60;

  if (totalDurationMinutes === 0) {
    return { wordsPerMinute: 0, status: 'N/A' };
  }

  const totalWords = words.length;
  const wpm = Math.round(totalWords / totalDurationMinutes);

  // Determine the status based on the WPM.
  let status;
  if (wpm > 170) {
    status = 'Too Fast';
  } else if (wpm >= 130 && wpm <= 170) {
    status = 'Good';
  } else {
    status = 'Too Slow';
  }

  return { wordsPerMinute: wpm, status: status };
}
function analyzeFillerWords(transcript) {
  const fillerWordList = ['um', 'uh', 'like', 'you know', 'so', 'right', 'actually', 'basically', 'i mean'];
  const fillerWordCounts = {};

  // Clean and split the transcript into individual words.
  const words = transcript.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);

  for (const word of words) {
    if (fillerWordList.includes(word)) {
      fillerWordCounts[word] = (fillerWordCounts[word] || 0) + 1;
    }
  }

  // Your component expects data in a specific format, so this result is ready to use.
  // e.g., { um: 5, like: 3 }
  return fillerWordCounts;
}


function calculateClarity(words) {
  if (!words || words.length === 0) return 0;

  // Sum up all the confidence scores.
  const totalConfidence = words.reduce((acc, word) => acc + word.confidence, 0);

  // Calculate the average and scale to 100.
  const averageConfidence = totalConfidence / words.length;
  return Math.round(averageConfidence * 100);
}

function calculateFluency(words, fillerWordCount) {
  if (!words || words.length < 2) return 100;

  const totalWords = words.length;
  let longPauseCount = 0;
  const pauseThreshold = 1.5; // A pause over 1.5 seconds is considered long.

  // Count long pauses between words.
  for (let i = 0; i < words.length - 1; i++) {
    const pauseDuration = words[i + 1].startTime.seconds - words[i].endTime.seconds;
    if (pauseDuration > pauseThreshold) {
      longPauseCount++;
    }
  }

  // Penalize the score based on filler words and long pauses.
  // Example: Each filler word costs 2 points, each long pause costs 4 points.
  const fillerPenalty = fillerWordCount * 2;
  const pausePenalty = longPauseCount * 4;

  const totalPenalty = fillerPenalty + pausePenalty;
  
  // Ensure the score doesn't go below 0.
  const fluencyScore = Math.max(0, 100 - totalPenalty);
  return fluencyScore;
}

function scorePace(wpm) {
  const idealWpm = 150;
  const acceptableRange = 20; // WPM can be +/- 20 from ideal without penalty.

  const difference = Math.abs(wpm - idealWpm);

  if (difference <= acceptableRange) {
    return 100;
  }

  // The further away from the ideal range, the lower the score.
  const penalty = (difference - acceptableRange) * 1.5; // Penalize 1.5 points for each WPM outside the range
  return Math.max(0, 100 - penalty);
}

function calculateOverallScore(metrics) {
  // Define weights for each metric. They should add up to 1.0.
  const weights = {
    clarity: 0.30,    // 30%
    fluency: 0.30,    // 30%
    pace: 0.20,       // 20%
    confidence: 0.20, // 20%
    // Note: Tone is excluded here but you could add it.
  };

  const overallScore = 
    (metrics.clarity * weights.clarity) +
    (metrics.fluency * weights.fluency) +
    (metrics.pace * weights.pace) +
    (metrics.confidence * weights.confidence);

  return Math.round(overallScore);
}

function generateFeedback(metrics, pace, fillerWordCount) {
  const strengths = [];
  const areasForImprovement = [];
  const recommendations = [];

  // Strengths Logic
  if (pace.status === 'Good') strengths.push("Your speaking pace was excellent and engaging.");
  if (metrics.clarity > 90) strengths.push("Exceptional clarity. Your words were very easy to understand.");
  if (fillerWordCount === 0) strengths.push("Fantastic job avoiding filler words.");

  // Improvement & Recommendation Logic
  if (pace.status === 'Too Fast') {
    areasForImprovement.push("Speaking pace was too fast.");
    recommendations.push("Try to build in deliberate pauses after key sentences to control your speed and allow your audience to digest information.");
  }
  if (metrics.fluency < 70) {
    areasForImprovement.push("Speech fluency could be improved.");
    recommendations.push("Practice your speech to become more comfortable. When you catch yourself using a filler word, try to replace it with a silent pause.");
  }
  // ... and so on for all other metrics.

  return { strengths, areasForImprovement, recommendations };
}

// The main controller function
exports.analyzeSpeech = async (req, res) => {
  console.log('🎤 analyzeSpeech called');
  console.log('   - Has file:', !!req.file);
  console.log('   - File buffer size:', req.file?.buffer?.length);
  
  if (!req.file) {
    return res.status(400).json({ message: 'Audio file is required.' });
  }

  // Handle authentication (optional - support guest mode)
  let userId = null;
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      const user = await User.findById(decoded.userId);
      if (user) {
        userId = user._id;
        console.log('   - Authenticated user:', user.email);
      }
    } catch (authError) {
      console.log('   - Auth failed, continuing as guest:', authError.message);
    }
  } else {
    console.log('   - No token provided, treating as guest');
  }

  try {
    const audioBytes = req.file.buffer.toString('base64');

    const audio = {
      content: audioBytes,
    };
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      enableAutomaticPunctuation: true,
    };
    const request = {
      audio: audio,
      config: config,
    };

    // 1. Call Google Speech-to-Text API
    const [response] = await speechClient.recognize(request);
    const result = response.results[0];
    if (!result || !result.alternatives[0]) {
      return res.status(500).json({ message: 'Could not transcribe audio.' });
    }

    const transcript = result.alternatives[0].transcript || '';
    const words = result.alternatives[0].words || [];

    // Check if transcript is empty or too short
    if (!transcript || transcript.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Audio is too short or unclear. Please record at least 5 seconds of clear speech.',
        error: 'Insufficient audio content'
      });
    }

    console.log('   - Transcript:', transcript.substring(0, 50) + '...');
    console.log('   - Word count:', words.length);

    // 2. Run all our analysis functions
    const fillerWords = analyzeFillerWords(transcript);
    const fillerWordCount = Object.values(fillerWords).reduce((sum, count) => sum + count, 0);
    const pace = calculatePace(words);
    
    const metrics = {};
    metrics.clarity = calculateClarity(words);
    metrics.fluency = calculateFluency(words, fillerWordCount);
    metrics.pace = scorePace(pace.wordsPerMinute);
    // For now, confidence is a composite. Tone would require another API call.
    metrics.confidence = Math.round((metrics.clarity * 0.4) + (metrics.fluency * 0.4) + (metrics.pace * 0.2));
    metrics.tone = 75; // Placeholder for tone

    const overallScore = Math.round(
      (metrics.clarity * 0.3) +
      (metrics.fluency * 0.3) +
      (metrics.pace * 0.2) +
      (metrics.confidence * 0.2)
    );

    const { strengths, areasForImprovement, recommendations } = generateFeedback(metrics, pace, fillerWordCount);

    // 3. Construct the final report object
    const analysisData = {
      transcript,
      overallScore,
      metrics,
      pace,
      fillerWords,
      strengths,
      areasForImprovement,
      recommendations,
    };

    // 4. Save to Database only if user is authenticated
    let reportId = null;
    if (userId) {
      const newReport = new AnalysisReport({
        user: userId,  // Changed from userId to user to match schema
        transcript: analysisData.transcript,
        overallScore: analysisData.overallScore,
        metrics: analysisData.metrics,
        pace: analysisData.pace,
        fillerWords: analysisData.fillerWords,
        strengths: analysisData.strengths,
        areasForImprovement: analysisData.areasForImprovement,
        recommendations: analysisData.recommendations,
      });
      await newReport.save();
      reportId = newReport._id;
      console.log('   - Report saved to DB:', reportId);
    } else {
      console.log('   - Guest mode: analysis not saved to DB');
    }

    // 5. Send report back to client
    res.status(200).json({
      message: "Analysis completed successfully",
      report: {
        id: reportId,
        ...analysisData,
        createdAt: new Date(),
      },
    });

  } catch (error) {
    console.error('❌ Error during speech analysis:', error);
    res.status(500).json({ message: 'Server error during analysis.', error: error.message });
  }
};