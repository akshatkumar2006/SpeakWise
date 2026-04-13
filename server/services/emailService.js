/**
 * Email Service Integration Example
 * 
 * This file demonstrates how to integrate email notifications
 * with the contact form. Choose one of the services below.
 * 
 * File: server/services/emailService.js
 */

const nodemailer = require('nodemailer');

/**
 * Generic Email Configuration
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@speakwise.ai',
  replyTo: 'support@speakwise.ai',
  subject_prefix: '[SpeakWise] '
};

/**
 * OPTION 1: SendGrid Integration
 * https://sendgrid.com
 * 
 * Setup:
 * 1. npm install @sendgrid/mail
 * 2. Add SENDGRID_API_KEY to .env
 */
const setupSendGrid = () => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return sgMail;
};

const sendViaSendGrid = async (contactData) => {
  const sgMail = setupSendGrid();

  const msg = {
    to: 'support@speakwise.ai',
    from: EMAIL_CONFIG.from,
    replyTo: contactData.email,
    subject: `${EMAIL_CONFIG.subject_prefix}${contactData.subject}`,
    html: generateEmailHTML(contactData),
    text: generateEmailText(contactData)
  };

  try {
    await sgMail.send(msg);
    return { success: true, service: 'SendGrid' };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

/**
 * OPTION 2: Mailgun Integration
 * https://www.mailgun.com
 * 
 * Setup:
 * 1. npm install mailgun.js
 * 2. Add MAILGUN_API_KEY and MAILGUN_DOMAIN to .env
 */
const setupMailgun = () => {
  const mailgun = require('mailgun.js');
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
  });
};

const sendViaMailgun = async (contactData) => {
  const mg = setupMailgun();

  try {
    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      {
        from: EMAIL_CONFIG.from,
        to: 'support@speakwise.ai',
        'h:Reply-To': contactData.email,
        subject: `${EMAIL_CONFIG.subject_prefix}${contactData.subject}`,
        html: generateEmailHTML(contactData),
        text: generateEmailText(contactData)
      }
    );
    return { success: true, service: 'Mailgun', id: result.id };
  } catch (error) {
    console.error('Mailgun error:', error);
    throw error;
  }
};

/**
 * OPTION 3: AWS SES Integration
 * https://aws.amazon.com/ses
 * 
 * Setup:
 * 1. npm install aws-sdk
 * 2. Configure AWS credentials
 * 3. Add AWS region to .env
 */
const setupAWSSES = () => {
  const AWS = require('aws-sdk');
  return new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' });
};

const sendViaAWSSES = async (contactData) => {
  const ses = setupAWSSES();

  const params = {
    Source: EMAIL_CONFIG.from,
    Destination: {
      ToAddresses: ['support@speakwise.ai']
    },
    Message: {
      Subject: {
        Data: `${EMAIL_CONFIG.subject_prefix}${contactData.subject}`,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: generateEmailHTML(contactData),
          Charset: 'UTF-8'
        },
        Text: {
          Data: generateEmailText(contactData),
          Charset: 'UTF-8'
        }
      }
    },
    ReplyToAddresses: [contactData.email]
  };

  try {
    const result = await ses.sendEmail(params).promise();
    return { success: true, service: 'AWS SES', id: result.MessageId };
  } catch (error) {
    console.error('AWS SES error:', error);
    throw error;
  }
};

/**
 * OPTION 4: Nodemailer Integration (SMTP)
 * https://nodemailer.com
 * 
 * Setup:
 * 1. npm install nodemailer
 * 2. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to .env
 * 
 * Example providers:
 * - Gmail (requires app password)
 * - Office 365
 * - Custom SMTP server
 */
const setupNodemailer = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendViaNodemailer = async (contactData) => {
  const transporter = setupNodemailer();

  try {
    const result = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: 'support@speakwise.ai',
      replyTo: contactData.email,
      subject: `${EMAIL_CONFIG.subject_prefix}${contactData.subject}`,
      html: generateEmailHTML(contactData),
      text: generateEmailText(contactData)
    });
    return { success: true, service: 'Nodemailer', id: result.messageId };
  } catch (error) {
    console.error('Nodemailer error:', error);
    throw error;
  }
};

/**
 * OPTION 5: PostMark Integration
 * https://postmarkapp.com
 * 
 * Setup:
 * 1. npm install postmark
 * 2. Add POSTMARK_API_TOKEN to .env
 */
const sendViaPostmark = async (contactData) => {
  const postmark = require('postmark');
  const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

  try {
    const result = await client.sendEmail({
      From: EMAIL_CONFIG.from,
      To: 'support@speakwise.ai',
      ReplyTo: contactData.email,
      Subject: `${EMAIL_CONFIG.subject_prefix}${contactData.subject}`,
      HtmlBody: generateEmailHTML(contactData),
      TextBody: generateEmailText(contactData)
    });
    return { success: true, service: 'PostMark', id: result.MessageID };
  } catch (error) {
    console.error('PostMark error:', error);
    throw error;
  }
};

/**
 * Generate HTML email template
 */
const generateEmailHTML = (contactData) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #1E2A5A, #2A3A7A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1FB6A6; }
          .message { background: white; padding: 15px; border-left: 4px solid #1FB6A6; border-radius: 4px; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .button { background: #1FB6A6; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">From:</span> ${escapeHTML(contactData.name)}
            </div>
            
            <div class="field">
              <span class="label">Email:</span> 
              <a href="mailto:${escapeHTML(contactData.email)}">${escapeHTML(contactData.email)}</a>
            </div>
            
            <div class="field">
              <span class="label">Subject:</span> ${escapeHTML(contactData.subject)}
            </div>
            
            <div class="field">
              <span class="label">Message:</span>
              <div class="message">
                ${escapeHTML(contactData.message).replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="field">
              <span class="label">Submitted at:</span> ${new Date(contactData.timestamp).toLocaleString()}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${escapeHTML(contactData.email)}?subject=Re: ${escapeHTML(contactData.subject)}" class="button">
                Reply to ${contactData.name}
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was generated by the SpeakWise Contact Form.</p>
            <p>Reply directly to this email to contact the sender.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate plain text email
 */
const generateEmailText = (contactData) => {
  return `
NEW CONTACT FORM SUBMISSION

From: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}

---
Submitted: ${new Date(contactData.timestamp).toLocaleString()}
  `;
};

/**
 * Escape HTML special characters
 */
const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
};

/**
 * Main email sending function
 * Routes to the configured email service
 */
const sendContactEmail = async (contactData) => {
  const emailService = process.env.EMAIL_SERVICE || 'nodemailer';

  const services = {
    sendgrid: sendViaSendGrid,
    mailgun: sendViaMailgun,
    'aws-ses': sendViaAWSSES,
    nodemailer: sendViaNodemailer,
    postmark: sendViaPostmark
  };

  const sendFunction = services[emailService.toLowerCase()];

  if (!sendFunction) {
    throw new Error(`Unsupported email service: ${emailService}`);
  }

  try {
    console.log(`[EMAIL] Sending via ${emailService}...`);
    const result = await sendFunction(contactData);
    console.log(`[EMAIL] Successfully sent via ${result.service}`, result);
    return result;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send via ${emailService}:`, error);
    throw error;
  }
};

/**
 * Send confirmation email to the sender
 */
const sendConfirmationToUser = async (email, name) => {
  const emailService = process.env.EMAIL_SERVICE || 'nodemailer';

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Thank you for contacting SpeakWise! 🎉</h2>
          <p>Hi ${escapeHTML(name)},</p>
          <p>We've received your message and appreciate you reaching out to us.</p>
          <p>Our team will review your inquiry and get back to you as soon as possible.</p>
          <p style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666;">
            Best regards,<br>
            The SpeakWise Team<br>
            <a href="https://speakwise.ai">speakwise.ai</a>
          </p>
        </div>
      </body>
    </html>
  `;

  const services = {
    sendgrid: setupSendGrid,
    mailgun: setupMailgun,
    nodemailer: setupNodemailer,
    postmark: () => require('postmark')
  };

  if (emailService.toLowerCase() === 'sendgrid') {
    const sgMail = setupSendGrid();
    await sgMail.send({
      to: email,
      from: EMAIL_CONFIG.from,
      subject: 'We received your message - SpeakWise',
      html: html
    });
  } else if (emailService.toLowerCase() === 'nodemailer') {
    const transporter = setupNodemailer();
    await transporter.sendMail({
      to: email,
      from: EMAIL_CONFIG.from,
      subject: 'We received your message - SpeakWise',
      html: html
    });
  }
  // Add other services as needed
};

module.exports = {
  sendContactEmail,
  sendConfirmationToUser,
  generateEmailHTML,
  generateEmailText
};

/**
 * ENVIRONMENT VARIABLES TEMPLATE
 * 
 * Copy to .env file and fill in your values:
 * 
 * # Email Service Configuration
 * EMAIL_SERVICE=nodemailer  # Options: sendgrid, mailgun, aws-ses, nodemailer, postmark
 * EMAIL_FROM=noreply@speakwise.ai
 * 
 * # SendGrid
 * SENDGRID_API_KEY=your_sendgrid_api_key
 * 
 * # Mailgun
 * MAILGUN_API_KEY=your_mailgun_api_key
 * MAILGUN_DOMAIN=sandbox.mailgun.org
 * 
 * # AWS SES
 * AWS_REGION=us-east-1
 * AWS_ACCESS_KEY_ID=your_access_key
 * AWS_SECRET_ACCESS_KEY=your_secret_key
 * 
 * # Nodemailer (SMTP)
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_SECURE=false
 * SMTP_USER=your-email@gmail.com
 * SMTP_PASS=your-app-password
 * 
 * # PostMark
 * POSTMARK_API_TOKEN=your_postmark_token
 */

/**
 * USAGE IN ROUTE HANDLER
 * 
 * In server/routes/contact.routes.js:
 * 
 * const { sendContactEmail, sendConfirmationToUser } = require('../services/emailService');
 * 
 * router.post('/contact', async (req, res) => {
 *   try {
 *     const { name, email, subject, message, timestamp } = req.body;
 *     
 *     // Send notification email to support
 *     await sendContactEmail({ name, email, subject, message, timestamp });
 *     
 *     // Send confirmation email to user (optional)
 *     await sendConfirmationToUser(email, name);
 *     
 *     res.json({
 *       success: true,
 *       message: 'Message sent successfully'
 *     });
 *   } catch (error) {
 *     console.error('Contact form error:', error);
 *     res.status(500).json({
 *       success: false,
 *       error: 'Failed to process contact form'
 *     });
 *   }
 * });
 */
