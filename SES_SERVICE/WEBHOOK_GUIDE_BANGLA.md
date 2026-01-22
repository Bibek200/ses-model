# 🎯 Webhook সমস্যার সমাধান - সম্পূর্ণ গাইড

## ❌ আগে কি সমস্যা ছিল?

আপনার প্রজেক্টে `https://api.nexus.com/v1/webhook` URL configure করা ছিল, কিন্তু:

1. ❌ কোন endpoint ছিল না যেটা data receive করবে
2. ❌ External services থেকে data পাঠালে 404 error আসত
3. ❌ Webhook logs দেখার কোন system ছিল না
4. ❌ Email notification system ছিল না

## ✅ এখন কি কি যোগ করা হয়েছে?

### 1. Webhook Receiver Endpoints (server/index.js)

```javascript
POST /api/webhook      // Main webhook endpoint
POST /v1/webhook       // Alternative path
GET /api/webhook-logs  // Webhook logs দেখার জন্য
```

**এই endpoints কি করে:**
- ✅ External services থেকে data receive করে
- ✅ MongoDB এ webhook logs save করে
- ✅ Admin email এ instant notification পাঠায়
- ✅ Success/failure response দেয়
- ✅ Active/inactive status check করে

### 2. Webhook Logs Component (client/components/AdminWebhookLogs.tsx)

**Features:**
- ✅ Real-time webhook activity monitor
- ✅ Success/failed events আলাদা করে দেখায়
- ✅ Complete payload data display
- ✅ Timestamp সহ সব details
- ✅ Refresh button
- ✅ Statistics dashboard

### 3. Test Scripts

**test-webhook.js** - Node.js দিয়ে test করার জন্য
**test-webhook.ps1** - PowerShell দিয়ে test করার জন্য

## 🚀 কিভাবে ব্যবহার করবেন?

### Step 1: Server Start করুন

```bash
cd C:\Users\Admin\Desktop\SES_SERVICE
npm run dev
```

Server চালু হলে console এ দেখবেন:
```
🚀 Server running on http://localhost:5001
✅ MongoDB connected successfully
```

### Step 2: Webhook Test করুন

#### Option A: Node.js Script দিয়ে (Recommended)

```bash
node test-webhook.js
```

#### Option B: Postman/Insomnia দিয়ে

**Request Details:**
- **Method:** POST
- **URL:** `http://localhost:5001/api/webhook`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "event": "test_event",
  "data": {
    "name": "Test User",
    "email": "test@example.com",
    "message": "Testing webhook"
  }
}
```

#### Option C: Browser Console দিয়ে

```javascript
fetch('http://localhost:5001/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'test',
    data: { name: 'Test', email: 'test@example.com' }
  })
})
.then(r => r.json())
.then(console.log)
```

### Step 3: Results Verify করুন

✅ **Console এ দেখবেন:**
```
📥 Webhook received: { event: "test_event", ... }
✅ Webhook log saved to database
✅ Email notification sent to: admin@nexus.com
```

✅ **Admin Email এ পাবেন:**
- Subject: "🔔 New Webhook Data Received"
- Complete payload data
- Timestamp

✅ **Admin Panel এ:**
- Webhook Logs section এ নতুন entry
- Status: Success
- Complete payload visible

## 📊 Admin Panel এ Webhook Logs দেখুন

### Component যোগ করুন:

আপনার admin routing file এ (যেমন: `App.tsx` বা `AdminRoutes.tsx`):

```tsx
import AdminWebhookLogs from './components/AdminWebhookLogs';

// Route যোগ করুন:
<Route path="/admin/webhook-logs" element={<AdminWebhookLogs />} />
```

### Navigation যোগ করুন:

Admin sidebar/menu তে:

```tsx
<Link to="/admin/webhook-logs">
  <Activity className="h-5 w-5" />
  <span>Webhook Logs</span>
</Link>
```

## 🌐 Production Deployment

### 1. Environment Variables

`.env` file এ যোগ করুন:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_here

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Webhook URL Update

Production এ deploy করার পর, webhook config update করুন:

**Local Development:**
```
http://localhost:5001/api/webhook
```

**Production:**
```
https://your-domain.com/api/webhook
```

### 3. External Services Configure করুন

যেসব third-party services থেকে webhook data আসবে (payment gateway, form services, etc.), সেখানে আপনার webhook URL দিন:

```
https://your-domain.com/api/webhook
```

## 🔐 Security & Best Practices

### 1. Webhook Active/Inactive Toggle

Admin panel থেকে webhook on/off করতে পারবেন:

```javascript
// Webhook config এ
{
  "isActive": true  // false করলে webhook disabled হবে
}
```

### 2. Error Handling

সব errors automatically log হয় এবং admin কে notify করা হয়:

```javascript
{
  "status": "failed",
  "error": "Error message here",
  "payload": { ... }
}
```

### 3. Rate Limiting (Optional - Future Enhancement)

Production এ rate limiting যোগ করতে পারেন:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.post('/api/webhook', webhookLimiter, async (req, res) => {
  // ...
});
```

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Solution:**
```bash
# Check if server is running
curl http://localhost:5001/health

# If not running, start it
npm run dev
```

### Issue 2: "Webhook is disabled"

**Solution:**
- Admin panel এ যান
- Webhook Config section এ
- "Active Ingestion" toggle ON করুন

### Issue 3: "Email not sending"

**Solution:**
1. `.env` file check করুন
2. Gmail এর জন্য "App Password" use করুন (normal password নয়)
3. Webhook config এ সঠিক email দেওয়া আছে কিনা verify করুন

### Issue 4: "Logs not showing"

**Solution:**
1. MongoDB connected আছে কিনা check করুন
2. Browser console এ errors check করুন
3. API endpoint test করুন: `http://localhost:5001/api/webhook-logs`

## 📝 Example Use Cases

### 1. Payment Gateway Webhook

```json
{
  "event": "payment.success",
  "transactionId": "TXN123456",
  "data": {
    "orderId": "ORD789",
    "amount": 5000,
    "currency": "BDT",
    "customerEmail": "customer@example.com",
    "paymentMethod": "bKash"
  }
}
```

### 2. Form Submission Webhook

```json
{
  "event": "form.submission",
  "formId": "contact-form",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "message": "I need help with...",
    "submittedAt": "2026-01-22T13:17:23Z"
  }
}
```

### 3. User Registration Webhook

```json
{
  "event": "user.registered",
  "data": {
    "userId": "USER123",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "registeredAt": "2026-01-22T13:17:23Z"
  }
}
```

## 🎉 Success Indicators

আপনার webhook সঠিকভাবে কাজ করছে কিনা বুঝবেন:

✅ Test script run করলে success message আসবে
✅ Server console এ "📥 Webhook received" দেখবেন
✅ Admin email এ notification পাবেন
✅ Webhook logs এ entry দেখতে পাবেন
✅ Response এ `success: true` পাবেন

## 📞 Support

যদি কোন সমস্যা হয়:

1. Server logs check করুন
2. Browser console check করুন
3. MongoDB connection verify করুন
4. Email configuration verify করুন
5. Test script দিয়ে test করুন

---

**🎯 সব কিছু ঠিকমতো setup হয়ে গেছে! এখন আপনার webhook fully functional এবং production-ready!**

Made with ❤️ for SES Service
