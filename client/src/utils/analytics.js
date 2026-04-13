/**
 * Google Analytics Tracking Utility
 * Track key events in SpeakWise
 */

import ReactGA from 'react-ga4';

// Initialize GA (called once in App.jsx)
export const initializeGA = () => {
  ReactGA.initialize('G-B93EWKZNHY');
  console.log('✅ Google Analytics initialized');
};

// Track Page Views (automatic with React Router)
export const trackPageView = (path, title) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title
  });
  console.log(`📊 Page view tracked: ${title}`);
};

// Track Contact Form Submission
export const trackContactFormSubmit = (subject) => {
  ReactGA.event('contact_form_submit', {
    event_category: 'engagement',
    event_label: subject,
    value: 1
  });
  console.log('📧 Contact form submission tracked');
};

// Track Sign Up
export const trackSignUp = (method) => {
  ReactGA.event('sign_up', {
    method: method // 'email', 'google', 'github'
  });
  console.log('🆕 Sign up tracked:', method);
};

// Track Login
export const trackLogin = (method) => {
  ReactGA.event('login', {
    method: method // 'email', 'google', 'github'
  });
  console.log('🔐 Login tracked:', method);
};

// Track Practice Session Started
export const trackPracticeSessionStart = (type) => {
  ReactGA.event('practice_session_start', {
    session_type: type, // 'interview', 'presentation', 'conversation'
    value: 1
  });
  console.log('🎤 Practice session started:', type);
};

// Track Practice Session Completed
export const trackPracticeSessionComplete = (type, duration) => {
  ReactGA.event('practice_session_complete', {
    session_type: type,
    duration_seconds: duration,
    value: 1
  });
  console.log('✅ Practice session completed:', type, `(${duration}s)`);
};

// Track AI Feedback Generated
export const trackAIFeedbackGenerated = (type) => {
  ReactGA.event('ai_feedback_generated', {
    feedback_type: type, // 'pronunciation', 'fluency', 'content', 'overall'
    value: 1
  });
  console.log('🤖 AI feedback generated:', type);
};

// Track Feature Used
export const trackFeatureUsed = (feature) => {
  ReactGA.event('feature_used', {
    feature_name: feature,
    value: 1
  });
  console.log('⚡ Feature used:', feature);
};

// Track Error
export const trackError = (error, errorType) => {
  ReactGA.event('error', {
    error_type: errorType,
    error_message: error,
    value: 1
  });
  console.error('❌ Error tracked:', errorType, error);
};

// Track Custom Event
export const trackCustomEvent = (eventName, eventData) => {
  ReactGA.event(eventName, eventData);
  console.log(`📈 Custom event tracked: ${eventName}`, eventData);
};

export default {
  initializeGA,
  trackPageView,
  trackContactFormSubmit,
  trackSignUp,
  trackLogin,
  trackPracticeSessionStart,
  trackPracticeSessionComplete,
  trackAIFeedbackGenerated,
  trackFeatureUsed,
  trackError,
  trackCustomEvent
};
