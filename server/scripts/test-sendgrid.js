#!/usr/bin/env node

/**
 * Test SendGrid Email Configuration
 * Run this to verify SendGrid is working correctly
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('🧪 Testing SendGrid Configuration...\n');

// Check API key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error('❌ SENDGRID_API_KEY not found in .env file');
  process.exit(1);
}

console.log('✅ API Key found');
console.log('   Key (masked):', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 10));

// Initialize SendGrid
try {
  sgMail.setApiKey(apiKey);
  console.log('✅ SendGrid client initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize SendGrid:', error.message);
  process.exit(1);
}

// Test email
const testEmail = {
  to: process.env.CONTACT_FORM_ADMIN_EMAIL || 'speakwise.aicoach@gmail.com',
  from: process.env.SENDGRID_FROM_EMAIL || 'noreply@speakwise.com',
  subject: 'SpeakWise Contact Form Test',
  html: `
    <h2>Test Email from SpeakWise</h2>
    <p>This is a test email to verify SendGrid is working correctly.</p>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  `,
  text: `
Test Email from SpeakWise

This is a test email to verify SendGrid is working correctly.
Timestamp: ${new Date().toISOString()}
  `,
};

console.log('📧 Sending test email...');
console.log('   To:', testEmail.to);
console.log('   From:', testEmail.from);
console.log('   Subject:', testEmail.subject);
console.log('');

sgMail
  .send(testEmail)
  .then((response) => {
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', response[0].headers['x-message-id']);
    console.log('   Status:', response[0].status);
    console.log('\n🎉 SendGrid is working correctly!');
    console.log('   Check your inbox for the test email.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status:', error.status);
    if (error.response && error.response.body) {
      console.error('   Response:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  });
