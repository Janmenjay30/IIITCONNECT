const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const checkSendGridStatus = async () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    console.log('🔍 Checking SendGrid Configuration...\n');
    
    // Check 1: API Key
    console.log('1️⃣ API Key Check:');
    if (!apiKey) {
        console.log('   ❌ SENDGRID_API_KEY not found');
        return;
    }
    console.log('   ✅ API Key present:', apiKey.substring(0, 20) + '...');
    
    // Check 2: From Email
    console.log('\n2️⃣ From Email Check:');
    if (!fromEmail) {
        console.log('   ❌ SENDGRID_FROM_EMAIL not found');
        return;
    }
    console.log('   ✅ From Email:', fromEmail);
    
    // Check 3: SendGrid API Connection
    console.log('\n3️⃣ SendGrid API Connection:');
    sgMail.setApiKey(apiKey);
    
    const msg = {
        to: 'wasteemail9099@gmail.com',
        from: fromEmail,
        subject: 'Debug Test - IIITConnect',
        text: 'Test email for debugging',
        html: '<p>Test email</p>'
    };
    
    try {
        console.log('   📤 Sending test email to wasteemail9099@gmail.com...');
        const response = await sgMail.send(msg);
        
        console.log('   ✅ SendGrid accepted the email!');
        console.log('   📧 Status Code:', response[0].statusCode);
        console.log('   📧 Message ID:', response[0].headers['x-message-id']);
        
        console.log('\n4️⃣ Possible Reasons for Not Receiving:');
        console.log('   • Email is in SPAM folder (CHECK SPAM!)');
        console.log('   • Email provider blocking (Gmail sometimes delays)');
        console.log('   • Sender not verified in SendGrid dashboard');
        console.log('   • SendGrid account suspended/unverified');
        
        console.log('\n5️⃣ Next Steps:');
        console.log('   1. Check SPAM/Junk folder in wasteemail9099@gmail.com');
        console.log('   2. Wait 2-3 minutes (sometimes delayed)');
        console.log('   3. Go to SendGrid Dashboard → Activity Feed');
        console.log('      URL: https://app.sendgrid.com/email_activity');
        console.log('   4. Search for: wasteemail9099@gmail.com');
        console.log('   5. Check email status (Delivered/Bounced/Deferred)');
        
        console.log('\n6️⃣ SendGrid Dashboard Link:');
        console.log('   https://app.sendgrid.com/email_activity');
        console.log('   Filter by "wasteemail9099@gmail.com" to see delivery status');
        
    } catch (error) {
        console.log('   ❌ SendGrid API Error:', error.message);
        
        if (error.code === 403) {
            console.log('\n   ⚠️ PERMISSION DENIED - Common causes:');
            console.log('   • Sender email NOT VERIFIED in SendGrid');
            console.log('   • API key invalid or expired');
            console.log('   • SendGrid account suspended');
            console.log('\n   Fix: Go to SendGrid → Settings → Sender Authentication');
            console.log('        Verify your sender email: ' + fromEmail);
        }
        
        if (error.response) {
            console.log('\n   Response Details:');
            console.log('   ', JSON.stringify(error.response.body, null, 2));
        }
    }
};

checkSendGridStatus();
