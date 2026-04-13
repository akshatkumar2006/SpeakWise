/**
 * Email Service - Handles sending emails via SendGrid
 * This service sends:
 * 1. Contact form submissions to admin (speakwise.aicoach@gmail.com)
 * 2. Confirmation emails to users
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️  WARNING: SENDGRID_API_KEY not found in environment variables');
  console.warn('   Contact form emails will NOT be sent');
  console.warn('   Please set SENDGRID_API_KEY in your .env file');
} else {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid email service initialized with API key');
  } catch (error) {
    console.error('❌ Error initializing SendGrid:', error.message);
  }
}

/**
 * Send contact form submission to admin
 * @param {Object} contactData - Form data from user
 * @param {string} contactData.name - User's name
 * @param {string} contactData.email - User's email
 * @param {string} contactData.subject - Message subject
 * @param {string} contactData.message - Message body
 * @returns {Promise<Object>} SendGrid response
 */
const sendContactFormToAdmin = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;
    const adminEmail = process.env.CONTACT_FORM_ADMIN_EMAIL || 'speakwise.aicoach@gmail.com';
    
    console.log('📧 Preparing email for admin:', { adminEmail, from: email });

    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr>
      <h3>Message:</h3>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Sent from SpeakWise Contact Form</small></p>
    `;

    const msg = {
      to: adminEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@speakwise.com',
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      html: emailContent,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from SpeakWise Contact Form
      `,
    };

    console.log('📨 Sending via SendGrid...');
    const response = await sgMail.send(msg);
    console.log(`✅ Contact form email sent to ${adminEmail}`);
    console.log('📧 SendGrid response:', response[0].headers['x-message-id']);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending contact form email:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status:', error.status);
    if (error.response) {
      console.error('   Response:', error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send confirmation email to user
 * @param {string} userEmail - Recipient email
 * @param {string} userName - Recipient name
 * @returns {Promise<Object>} SendGrid response
 */
const sendConfirmationToUser = async (userEmail, userName) => {
  try {
    const emailContent = `
      <h2>We received your message!</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Thank you for reaching out to SpeakWise. We've received your message and will get back to you as soon as possible.</p>
      <p>In the meantime, feel free to explore our platform and check out our speech coaching features!</p>
      <hr>
      <p>Best regards,<br/>The SpeakWise Team</p>
    `;

    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@speakwise.com',
      subject: 'We received your message - SpeakWise',
      html: emailContent,
      text: `
We received your message!

Hi ${userName},

Thank you for reaching out to SpeakWise. We've received your message and will get back to you as soon as possible.

In the meantime, feel free to explore our platform and check out our speech coaching features!

Best regards,
The SpeakWise Team
      `,
    };

    const response = await sgMail.send(msg);
    console.log(`✅ Confirmation email sent to ${userEmail}`);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
};

/**
 * Helper function to escape HTML and prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

module.exports = {
  sendContactFormToAdmin,
  sendConfirmationToUser,
  escapeHtml
};
