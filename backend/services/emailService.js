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

// Send Task Assignment Email
const sendTaskAssignmentEmail = async ({
  recipientEmail,
  recipientName,
  taskTitle,
  taskDescription,
  projectTitle,
  assignedBy,
  dueDate,
  priority,
  projectId
}) => {
  try {
    const transporter = createTransporter();
    
    const priorityColors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444'
    };

    const priorityEmojis = {
      low: '🟢',
      medium: '🟡',
      high: '🔴'
    };

    const dueDateFormatted = dueDate 
      ? new Date(dueDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'No deadline set';

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .task-box { background: #F9FAFB; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .task-title { font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 10px; }
          .task-description { color: #4B5563; line-height: 1.6; margin: 15px 0; }
          .task-meta { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
          .meta-item { background: white; border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px 15px; }
          .meta-label { font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600; }
          .meta-value { font-size: 14px; color: #1F2937; margin-top: 4px; }
          .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; }
          .action-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          .action-button:hover { background: #5568d3; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Task Assigned</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new task in ${projectTitle}</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            
            <p><strong>${assignedBy}</strong> has assigned a new task to you in the <strong>${projectTitle}</strong> project.</p>
            
            <div class="task-box">
              <div class="task-title">${taskTitle}</div>
              <div class="task-description">${taskDescription}</div>
              
              <div class="task-meta">
                <div class="meta-item">
                  <div class="meta-label">Priority</div>
                  <div class="meta-value">
                    <span class="priority-badge" style="background-color: ${priorityColors[priority]}">
                      ${priorityEmojis[priority]} ${priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-label">Due Date</div>
                  <div class="meta-value">${dueDateFormatted}</div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-label">Assigned By</div>
                  <div class="meta-value">${assignedBy}</div>
                </div>
              </div>
            </div>
            
            <p style="margin-top: 25px;">
              <strong>Next Steps:</strong>
            </p>
            <ul style="color: #374151; line-height: 1.8;">
              <li>Review the task details carefully</li>
              <li>Update the task status as you progress</li>
              <li>Communicate with your team if you need help</li>
              <li>Mark the task as completed when done</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/projects/${projectId}" class="action-button">
                View Task in Project
              </a>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <strong>💡 Tip:</strong> You can also see this task in your project's team chat and update its status from there.
            </div>
          </div>
          
          <div class="footer">
            <p><strong>IIITConnect Team</strong></p>
            <p style="font-size: 12px; color: #9CA3AF;">This email was automatically generated. Please do not reply.</p>
            <p style="color: #6B7280;">&copy; ${new Date().getFullYear()} IIITConnect. Empowering student collaboration.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`📧 Attempting to send task assignment email to: ${recipientEmail}`);
    
    const result = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'IIITConnect'} <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `📋 New Task Assigned: ${taskTitle} - ${projectTitle}`,
      html: htmlTemplate,
      text: `Hi ${recipientName},\n\n${assignedBy} has assigned you a new task in ${projectTitle}:\n\nTask: ${taskTitle}\nDescription: ${taskDescription}\nPriority: ${priority}\nDue Date: ${dueDateFormatted}\n\nPlease log in to IIITConnect to view and manage this task.`
    });

    console.log(`✅ Task assignment email sent successfully to: ${recipientEmail}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send task assignment email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  testEmailConnection,
  sendTaskAssignmentEmail
};