// Production Webhook Test Script
// Tests your deployed Render server

const https = require('https');
const url = require('url');

// Your production webhook URL
const PRODUCTION_URL = 'https://ses-model-dgp9.onrender.com/api/webhook';

const testData = JSON.stringify({
    event: 'production_test',
    timestamp: new Date().toISOString(),
    data: {
        name: 'Production Test User',
        email: 'test@production.com',
        message: 'Testing webhook on deployed Render server',
        source: 'Production Test Script',
        environment: 'Render Deployment'
    }
});

const parsedUrl = url.parse(PRODUCTION_URL);

const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('🚀 Testing Production Webhook Endpoint...\n');
console.log('📍 URL:', PRODUCTION_URL);
console.log('🌐 Server:', parsedUrl.hostname);
console.log('\n📤 Sending test data...\n');
console.log('Payload:');
console.log(JSON.parse(testData));
console.log('\n⏳ Waiting for response...\n');

const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (res.statusCode === 200) {
            console.log('✅ SUCCESS! Webhook received on production server!\n');
        } else {
            console.log(`⚠️  Response Status: ${res.statusCode}\n`);
        }

        console.log('📊 Response:');
        try {
            const parsed = JSON.parse(responseData);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log(responseData);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (res.statusCode === 200) {
            console.log('\n✨ Next Steps:');
            console.log('   1. Check your admin email for notification');
            console.log('   2. View logs in admin panel: https://ses-model-dgp9.onrender.com/admin/webhook-logs');
            console.log('   3. Use this URL in external services: ' + PRODUCTION_URL);
        } else if (res.statusCode === 403) {
            console.log('\n⚠️  Webhook is disabled in admin panel');
            console.log('   → Go to admin panel and enable webhook');
        } else {
            console.log('\n❌ Error occurred. Check:');
            console.log('   1. Server is deployed and running');
            console.log('   2. MongoDB is connected');
            console.log('   3. Environment variables are set');
        }
        console.log('');
    });
});

req.on('error', (error) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERROR!\n');
    console.log('Error Details:');
    console.log(error.message);
    console.log('\n💡 Possible Issues:');
    console.log('   1. Server might be sleeping (Render free tier)');
    console.log('   2. Network/firewall issue');
    console.log('   3. Server deployment failed');
    console.log('\n🔧 Try:');
    console.log('   1. Visit: https://ses-model-dgp9.onrender.com/health');
    console.log('   2. Check Render dashboard for deployment status');
    console.log('   3. Wait 30 seconds and try again (server wake-up time)');
    console.log('');
});

req.write(testData);
req.end();
