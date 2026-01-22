// Simple webhook test script
const http = require('http');

const testData = JSON.stringify({
    event: 'test_webhook',
    timestamp: new Date().toISOString(),
    data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test webhook payload from Node.js',
        source: 'Node.js Test Script'
    }
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('🧪 Testing Webhook Endpoint...\n');
console.log('📤 Sending test data to: http://localhost:5001/api/webhook\n');
console.log('Payload:');
console.log(JSON.parse(testData));
console.log('');

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('✅ SUCCESS!\n');
        console.log('Response:');
        try {
            console.log(JSON.parse(responseData));
        } catch (e) {
            console.log(responseData);
        }
        console.log('\n✨ Webhook received successfully! Check your admin email and webhook logs.');
    });
});

req.on('error', (error) => {
    console.log('❌ ERROR!\n');
    console.log('Error Details:');
    console.log(error.message);
    console.log('\n⚠️  Make sure your server is running on port 5001');
});

req.write(testData);
req.end();
