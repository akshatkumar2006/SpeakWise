/**
 * Contact API Route Handler
 * 
 * Handles contact form submissions from the frontend.
 * Sends emails via SendGrid to admin and user confirmation emails.
 * 
 * File: server/routes/contact.routes.js
 */

const express = require('express');
const router = express.Router();
const { sendContactFormToAdmin, sendConfirmationToUser } = require('../services/email.service');
const rateLimit = require('express-rate-limit');

// Rate limiting: 5 contact form submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/contact
 * Handle contact form submission
 * 
 * Body:
 * {
 *   name: string,
 *   email: string,
 *   subject: string,
 *   message: string
 * }
 */
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('📧 Contact form submission received:', { name, email, subject });

    // Validate all fields
    const errors = {};
    
    if (!name || !name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    if (!email || !email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!subject || !subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters';
    } else if (subject.trim().length > 100) {
      errors.subject = 'Subject must be less than 100 characters';
    }

    if (!message || !message.trim()) {
      errors.message = 'Message is required';
    } else if (message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (message.trim().length > 5000) {
      errors.message = 'Message must be less than 5000 characters';
    }

    // Return validation errors
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Send email to admin
    try {
      console.log('📨 Sending email to admin...');
      await sendContactFormToAdmin({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });
      console.log('✅ Email sent to admin successfully');
    } catch (emailError) {
      console.error('❌ Failed to send contact form to admin:', emailError.message);
      console.error('Error details:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: emailError.message
      });
    }

    // Send confirmation email to user
    try {
      console.log('📨 Sending confirmation email to user...');
      await sendConfirmationToUser(email.trim(), name.trim());
      console.log('✅ Confirmation email sent to user successfully');
    } catch (confirmationError) {
      console.warn('⚠️ Confirmation email failed (but contact was sent):', confirmationError.message);
      // Don't fail the response - contact was already sent to admin
    }

    // Return success response
    console.log('✅ Contact form processed successfully');
    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim()
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in contact form handler:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      error: error.message
    });
  }
});

/**
 * Simple email validation
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = router;