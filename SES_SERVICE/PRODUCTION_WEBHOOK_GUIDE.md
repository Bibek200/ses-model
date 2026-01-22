# 🎯 Production Webhook Setup Guide (বাংলা)

## ✅ আপনার প্রশ্নের উত্তর:

**প্রশ্ন:** `https://api.nexus.com/v1/webhook` এটা কি use করব নাকি `https://ses-model-dgp9.onrender.com/v1/webhook` এটা use করব?

**উত্তর:** আপনাকে **আপনার deployed server URL ই use করতে হবে**:

```
✅ সঠিক URL: https://ses-model-dgp9.onrender.com/api/webhook
```

অথবা

```
✅ সঠিক URL: https://ses-model-dgp9.onrender.com/v1/webhook
```

❌ `https://api.nexus.com/v1/webhook` - এটা শুধু example/placeholder ছিল!

---

## 🚀 Production এ Webhook Setup করার Steps:

### Step 1: Code Deploy হয়েছে কিনা Verify করুন

✅ **আমি এইমাত্র code push করেছি GitHub এ**

এখন Render dashboard check করুন:

1. 🌐 যান: https://dashboard.render.com
2. 🔍 আপনার service খুঁজুন: `ses-model-dgp9`
3. 📊 "Events" tab এ দেখুন deployment status
4. ⏳ Deploy complete হওয়ার জন্য অপেক্ষা করুন (2-5 minutes)

### Step 2: Deployment Status Check করুন

Render dashboard এ দেখবেন:

```
✅ Deploy live (green) - Ready to use
⏳ Deploying (yellow) - Wait a few minutes
❌ Deploy failed (red) - Check logs
```

### Step 3: Health Check করুন

Browser এ যান:

```
https://ses-model-dgp9.onrender.com/health
```

যদি দেখেন:
```json
{"status": "Server is running"}
```

তাহলে server ঠিক আছে! ✅

### Step 4: Webhook Test করুন

#### Option A: Test Script দিয়ে (Recommended)

```bash
cd C:\Users\Admin\Desktop\SES_SERVICE
node test-webhook-production.js
```

#### Option B: Browser Console দিয়ে

Browser console এ paste করুন:

```javascript
fetch('https://ses-model-dgp9.onrender.com/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'browser_test',
    data: {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Testing from browser'
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

#### Option C: Postman দিয়ে

- **URL:** `https://ses-model-dgp9.onrender.com/api/webhook`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "event": "postman_test",
  "data": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Step 5: Admin Panel এ Webhook Config Update করুন

1. 🔐 Login করুন: https://ses-model-dgp9.onrender.com
2. 🎛️ Admin Panel → Webhook Config এ যান
3. 📝 Update করুন:

```
Email: your-admin-email@example.com
Domain: https://ses-model-dgp9.onrender.com/api/webhook
Active: ✅ ON
```

4. 💾 Save করুন

---

## 🔧 Render Deployment Troubleshooting

### Issue 1: "404 Cannot POST /api/webhook"

**কারণ:** Code এখনো deploy হয়নি

**সমাধান:**

1. Render dashboard check করুন
2. Manual deploy trigger করুন:
   - Dashboard → Your Service → "Manual Deploy" → "Deploy latest commit"
3. 2-5 minutes অপেক্ষা করুন
4. আবার test করুন

### Issue 2: "Server is sleeping"

**কারণ:** Render free tier এ 15 minutes inactive থাকলে server sleep mode এ যায়

**সমাধান:**

1. Health check URL visit করুন: `https://ses-model-dgp9.onrender.com/health`
2. 30-60 seconds অপেক্ষা করুন (server wake up হবে)
3. আবার webhook test করুন

### Issue 3: "403 Webhook is disabled"

**কারণ:** Admin panel এ webhook inactive আছে

**সমাধান:**

1. Admin panel → Webhook Config
2. "Active Ingestion" toggle ON করুন
3. Save করুন

### Issue 4: "500 Internal Server Error"

**কারণ:** MongoDB connection issue বা environment variables missing

**সমাধান:**

1. Render dashboard → Environment → Environment Variables check করুন
2. নিচের variables আছে কিনা verify করুন:
   ```
   MONGODB_URI=mongodb+srv://...
   ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-password
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```
3. Missing থাকলে add করুন এবং redeploy করুন

---

## 📋 Environment Variables Checklist

Render dashboard এ এই variables গুলো আছে কিনা check করুন:

```env
✅ MONGODB_URI          # MongoDB connection string
✅ ADMIN_EMAIL          # Admin login email
✅ ADMIN_PASSWORD       # Admin login password
✅ VIEWER_EMAIL         # Viewer login email (optional)
✅ VIEWER_PASSWORD      # Viewer login password (optional)
✅ EMAIL_SERVICE        # gmail
✅ EMAIL_USER           # Your Gmail address
✅ EMAIL_PASSWORD       # Gmail App Password
✅ PORT                 # 5001 (or auto-assigned by Render)
```

---

## 🎯 External Services এ Webhook URL Configure করুন

যখন সব কিছু ঠিকমতো কাজ করবে, তখন external services এ এই URL দিন:

### Payment Gateways (bKash, Nagad, SSLCommerz, etc.):

```
Webhook URL: https://ses-model-dgp9.onrender.com/api/webhook
Method: POST
Content-Type: application/json
```

### Form Services (Typeform, Google Forms with Apps Script, etc.):

```
Webhook URL: https://ses-model-dgp9.onrender.com/v1/webhook
Method: POST
```

### Other Services:

যেকোনো service যেটা webhook support করে, সেখানে এই URL দিন:

```
https://ses-model-dgp9.onrender.com/api/webhook
```

---

## ✅ Success Indicators

সব কিছু ঠিকমতো কাজ করছে কিনা বুঝবেন:

### 1. Test Script Success:
```
✅ SUCCESS! Webhook received on production server!
```

### 2. Response পাবেন:
```json
{
  "success": true,
  "message": "Webhook received and processed successfully",
  "timestamp": "2026-01-22T13:23:41.000Z",
  "dataReceived": true
}
```

### 3. Admin Email এ Notification:
- Subject: "🔔 New Webhook Data Received"
- Complete payload data

### 4. Admin Panel Logs:
- Webhook Logs section এ নতুন entry
- Status: Success
- Complete payload visible

---

## 🔄 Deployment Workflow

Future updates এর জন্য:

```bash
# 1. Code change করুন
# 2. Test করুন locally
npm run dev
node test-webhook.js

# 3. Git commit করুন
git add .
git commit -m "Your changes"

# 4. Push করুন
git push origin main

# 5. Render auto-deploy করবে (2-5 minutes)
# 6. Production test করুন
node test-webhook-production.js
```

---

## 📞 Quick Commands

### Local Test:
```bash
node test-webhook.js
```

### Production Test:
```bash
node test-webhook-production.js
```

### Health Check:
```bash
curl https://ses-model-dgp9.onrender.com/health
```

### Get Webhook Config:
```bash
curl https://ses-model-dgp9.onrender.com/api/webhook-config
```

### Get Webhook Logs:
```bash
curl https://ses-model-dgp9.onrender.com/api/webhook-logs
```

---

## 🎉 Final Checklist

Deploy করার আগে verify করুন:

- [ ] ✅ Code GitHub এ push হয়েছে
- [ ] ✅ Render এ deployment complete
- [ ] ✅ Health check working
- [ ] ✅ Environment variables set
- [ ] ✅ MongoDB connected
- [ ] ✅ Webhook test successful
- [ ] ✅ Email notification received
- [ ] ✅ Admin panel accessible
- [ ] ✅ Webhook logs visible

---

## 💡 Pro Tips

1. **Render Free Tier:** Server 15 minutes inactive থাকলে sleep করে। প্রথম request এ 30-60 seconds লাগতে পারে।

2. **Email Notifications:** Gmail এর জন্য normal password নয়, "App Password" use করতে হবে।

3. **MongoDB Atlas:** Free tier M0 cluster যথেষ্ট webhook logs এর জন্য।

4. **Webhook Logs:** Production এ প্রতি 50টা logs store হয়। Regular cleanup করুন।

5. **Testing:** Production এ test করার আগে local এ test করুন।

---

**🚀 এখন আপনার webhook fully deployed এবং production-ready!**

External services থেকে যেকোনো data এই URL এ পাঠালে সব কিছু automatically handle হবে:

```
https://ses-model-dgp9.onrender.com/api/webhook
```

Made with ❤️ for SES Service
