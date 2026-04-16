const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require('dotenv').config();

// Check if AWS credentials are properly configured
const hasValidCredentials = () => {
    return process.env.AWS_ACCESS_KEY_ID && 
           process.env.AWS_SECRET_ACCESS_KEY && 
           !process.env.AWS_ACCESS_KEY_ID.includes('your_') &&
           !process.env.AWS_SECRET_ACCESS_KEY.includes('your_');
};

const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
}

let AWS_SES = null;
if (hasValidCredentials()) {
    AWS_SES = new AWS.SES(SES_CONFIG);
    console.log('✅ AWS SES configured with real credentials');
} else {
    console.log('⚠️  AWS credentials not set. Using DEVELOPMENT MODE (console logging only)');
}

const sendEmail = async (recipientEmail, subject, htmlBody) => {
    // Development mode - if AWS credentials not configured
    if (!AWS_SES) {
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('📧 [DEVELOPMENT MODE] Email would be sent');
        console.log('═'.repeat(60));
        console.log(`To: ${recipientEmail}`);
        console.log(`Subject: ${subject}`);
        console.log('-'.repeat(60));
        console.log(htmlBody);
        console.log('═'.repeat(60));
        console.log('\n💡 Tip: To send real emails, configure AWS credentials in .env file\n');
        return { MessageId: 'dev-mode-' + Date.now() };
    }

    // Production mode - send real email via AWS SES
    const params = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
            ToAddresses: [recipientEmail],
        },
        ReplyToAddresses: [process.env.AWS_SES_SENDER],
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: htmlBody,
                },
                Text: {
                    Charset: 'UTF-8',
                    Data: htmlBody.replace(/<[^>]*>/g, ''),
                },
            },
        },
    };

    try {
        const result = await AWS_SES.sendEmail(params).promise();
        console.log('✅ Email sent successfully via AWS SES:', result.MessageId);
        return result;
    } catch (error) {
        console.error('❌ AWS SES Error:', error.message);
        // Fallback to dev mode logging
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('📧 [FALLBACK] Email content (AWS SES failed)');
        console.log('═'.repeat(60));
        console.log(`To: ${recipientEmail}`);
        console.log(`Subject: ${subject}`);
        console.log('-'.repeat(60));
        console.log(htmlBody);
        console.log('═'.repeat(60));
        console.log('\n');
        throw error;
    }
};

module.exports = { sendEmail };
