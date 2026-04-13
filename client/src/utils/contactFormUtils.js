/**
 * Contact Form Utilities
 * Helper functions for contact form validation and submission
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate contact form fields
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Errors object with field-level errors
 */
export const validateContactForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters';
  }

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Subject validation
  if (!formData.subject?.trim()) {
    errors.subject = 'Subject is required';
  } else if (formData.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters';
  } else if (formData.subject.trim().length > 200) {
    errors.subject = 'Subject must not exceed 200 characters';
  }

  // Message validation
  if (!formData.message?.trim()) {
    errors.message = 'Message is required';
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (formData.message.trim().length > 5000) {
    errors.message = 'Message must not exceed 5000 characters';
  }

  return errors;
};

/**
 * Format contact form data for API submission
 * @param {Object} formData - Raw form data
 * @returns {Object} - Formatted data for API
 */
export const formatContactData = (formData) => {
  return {
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    subject: formData.subject.trim(),
    message: formData.message.trim(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
};

/**
 * Submit contact form to backend API
 * Replace '/api/contact' with your actual backend endpoint
 * 
 * @param {Object} formData - Contact form data
 * @returns {Promise<Object>} - API response
 */
export const submitContactForm = async (formData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formatContactData(formData))
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mock submission for development (simulates API call)
 * @param {Object} formData - Contact form data
 * @returns {Promise<Object>} - Mock API response
 */
export const mockSubmitContactForm = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          message: 'Thank you for contacting us. We will get back to you soon.',
          submittedAt: new Date().toISOString()
        }
      });
    }, 1500);
  });
};

/**
 * Send confirmation email notification
 * @param {string} email - Email to send confirmation to
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Email service response
 */
export const sendConfirmationEmail = async (email, name) => {
  try {
    const response = await fetch('/api/email/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        template: 'contact-confirmation'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get contact form state from local storage
 * @returns {Object|null} - Saved form data or null
 */
export const getSavedContactForm = () => {
  try {
    const saved = localStorage.getItem('contactFormDraft');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error retrieving saved form:', error);
    return null;
  }
};

/**
 * Save contact form state to local storage
 * @param {Object} formData - Form data to save
 */
export const saveContactFormDraft = (formData) => {
  try {
    localStorage.setItem('contactFormDraft', JSON.stringify(formData));
  } catch (error) {
    console.error('Error saving form draft:', error);
  }
};

/**
 * Clear contact form draft from local storage
 */
export const clearContactFormDraft = () => {
  try {
    localStorage.removeItem('contactFormDraft');
  } catch (error) {
    console.error('Error clearing form draft:', error);
  }
};
