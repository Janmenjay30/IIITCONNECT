const nodemailer = require('nodemailer');

// Create email transporter with better configuration
const createTransporter = () => {
  console.log('🔧 Creating email transporter...');
  console.log('📧 Email User:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
  console.log('🔑 Email Password:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Email credentials not found in environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    // Additional security options
    secure: true,
    requireTLS: true,
    port: 465
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};

// Send OTP Email
const sendOTPEmail = async (email, name, otp) => {
  try {
    // Test connection first
    const isConnectionValid = await testEmailConnection();
    if (!isConnectionValid) {
      throw new Error('Email server connection failed');
    }

    const transporter = createTransporter();
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .otp-box { background: #F3F4F6; border: 2px dashed #4F46E5; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; margin: 15px 0; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 IIITConnect</h1>
            <h2>Welcome to IIITConnect!</h2>
          </div>
          
          <div class="content">
            <h3>Hello ${name}!</h3>
            
            <p>Thank you for joining <strong>IIITConnect</strong> - the platform where IIIT students connect, collaborate, and create amazing projects together!</p>
            
            <p>To complete your registration and verify your email address, please enter the verification code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 16px; color: #666;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 14px; color: #888;"><strong>⏰ This code expires in 10 minutes</strong></p>
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul style="color: #374151; line-height: 1.6;">
              <li>🚀 Create and join exciting project teams</li>
              <li>💬 Connect with fellow IIIT students</li>
              <li>🤝 Collaborate on innovative projects</li>
              <li>🌟 Build your professional network</li>
              <li>💡 Share ideas and get feedback</li>
            </ul>
            
            <div class="warning">
              <strong>🔒 Security Note:</strong> Never share this verification code with anyone. The IIITConnect team will never ask you to provide your verification code.
            </div>
            
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          
          <div class="footer">
            <p><strong>IIITConnect Team</strong></p>
            <p style="font-size: 12px; color: #9CA3AF;">This email was automatically generated. Please do not reply to this email.</p>
            <p style="color: #6B7280;">&copy; ${new Date().getFullYear()} IIITConnect. Connecting IIIT students worldwide.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    const result = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'IIITConnect'} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your IIITConnect Account - Welcome!',
      html: htmlTemplate,
      // Add text version as fallback
      text: `Hello ${name}! Your IIITConnect verification code is: ${otp}. This code expires in 10 minutes.`
    });

    console.log(`✅ Registration OTP email sent successfully to: ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    console.error('📧 Email User:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
    console.error('🔑 Email Password:', process.env.EMAIL_APP_PASSWORD ? 'Set (length: ' + process.env.EMAIL_APP_PASSWORD.length + ')' : 'NOT SET');
    
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  testEmailConnection
};