const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const emails = [
    'janmejaypanigrahi300@gmail.com',
    'wasteemail9099@gmail.com',
    'jp232323009@gmail.com'  // Send to yourself as well
];

const sendTestToMultiple = async () => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    console.log('📧 Sending test emails to multiple addresses...\n');
    
    for (const email of emails) {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: '🔔 Test - IIITConnect Email Verification',
            html: `
                <div style="font-family: Arial; padding: 20px; max-width: 600px;">
                    <h2 style="color: #4F46E5;">📧 Email Delivery Test</h2>
                    <p>This email was sent to: <strong>${email}</strong></p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                    <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>✅ If you see this, email delivery is working!</strong></p>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        Check your spam folder if you don't see this in inbox.
                    </p>
                </div>
            `
        };
        
        try {
            const response = await sgMail.send(msg);
            console.log(`✅ Sent to ${email} - Status: ${response[0].statusCode}`);
        } catch (error) {
            console.log(`❌ Failed to ${email} - ${error.message}`);
        }
    }
    
    console.log('\n📬 Check all inboxes (including SPAM folders!)');
    console.log('🔍 SendGrid Activity: https://app.sendgrid.com/email_activity');
};

sendTestToMultiple();
