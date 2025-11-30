const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const testSendGrid = async () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    if (!apiKey) {
        console.error('❌ SENDGRID_API_KEY not found in .env');
        process.exit(1);
    }
    
    if (!fromEmail) {
        console.error('❌ SENDGRID_FROM_EMAIL not found in .env');
        process.exit(1);
    }
    
    console.log('🔧 Testing SendGrid configuration...');
    console.log('📧 From Email:', fromEmail);
    console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
    
    sgMail.setApiKey(apiKey);
    
    const msg = {
        to: fromEmail, // Send to yourself
        from: fromEmail,
        subject: '✅ SendGrid Test - IIITConnect',
        text: 'This is a test email from IIITConnect using SendGrid API!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">✅ SendGrid is Working!</h1>
                <p>Congratulations! Your SendGrid integration is configured correctly.</p>
                <p><strong>IIITConnect</strong> can now send emails in production.</p>
                <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is a test email sent from your backend at ${new Date().toLocaleString()}
                </p>
            </div>
        `
    };
    
    try {
        console.log('\n📤 Sending test email...');
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('📧 Status Code:', response[0].statusCode);
        console.log('📧 Message ID:', response[0].headers['x-message-id']);
        console.log('\n🎉 SendGrid is configured correctly!');
        console.log(`📬 Check your inbox at ${fromEmail}`);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);
        
        if (error.response) {
            console.error('Response body:', error.response.body);
        }
        
        console.log('\n💡 Common issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. Sender email not verified (check SendGrid dashboard)');
        console.log('3. SendGrid account suspended or unverified');
        
        process.exit(1);
    }
};

testSendGrid();
