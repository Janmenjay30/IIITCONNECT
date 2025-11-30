const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sendTestEmail = async () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const toEmail = 'wasteemail9099@gmail.com';
    
    if (!apiKey || !fromEmail) {
        console.error('❌ SendGrid configuration missing in .env');
        process.exit(1);
    }
    
    console.log(`📧 Sending test email to: ${toEmail}`);
    console.log(`📧 From: ${fromEmail}`);
    
    sgMail.setApiKey(apiKey);
    
    const msg = {
        to: toEmail,
        from: fromEmail,
        subject: '✅ Test Email from IIITConnect',
        text: 'Hello! This is a test email from IIITConnect using SendGrid.',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">✅ Test Email</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">IIITConnect Email System</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
                    <p style="font-size: 16px; color: #374151;">Hello!</p>
                    
                    <p style="font-size: 16px; color: #374151;">
                        This is a test email from <strong>IIITConnect</strong> using SendGrid.
                    </p>
                    
                    <div style="background: #F3F4F6; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #1F2937;">
                            ✅ Your email system is working correctly!
                        </p>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px;">
                        Features enabled:
                    </p>
                    <ul style="color: #374151; line-height: 1.8;">
                        <li>Task assignment notifications</li>
                        <li>OTP verification emails</li>
                        <li>Team updates and alerts</li>
                    </ul>
                </div>
                
                <div style="background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; color: #6B7280; font-size: 12px;">
                        Sent at ${new Date().toLocaleString()}
                    </p>
                    <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
                        <strong>IIITConnect Team</strong>
                    </p>
                </div>
            </div>
        `
    };
    
    try {
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('📧 Status Code:', response[0].statusCode);
        console.log('📧 Message ID:', response[0].headers['x-message-id']);
        console.log(`\n📬 Check inbox at ${toEmail}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        if (error.response) {
            console.error('Response:', error.response.body);
        }
        process.exit(1);
    }
};

sendTestEmail();
