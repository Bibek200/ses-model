# 🎨 WordPress Elementor Webhook Integration Guide (বাংলা)

## 🎯 আপনার সমস্যা:

> "https://ses-model-dgp9.onrender.com/api/webhook এই URL টা WordPress Elementor তে use করলে চাচ্ছি কিন্তু data আসছে না কেন client URL এ?"

## ✅ সমাধান করা হয়েছে!

আমি এইমাত্র **CORS (Cross-Origin Resource Sharing)** enable করেছি যেটা WordPress থেকে আপনার server এ data পাঠাতে দরকার ছিল।

---

## 🔧 কি কি Fix করা হয়েছে:

### 1. ✅ Enhanced CORS Configuration
- সব origins থেকে requests allow করা হয়েছে
- WordPress Elementor compatibility যোগ করা হয়েছে
- Preflight requests handle করা হয়েছে

### 2. ✅ URL-Encoded Data Support
- WordPress forms সাধারণত `application/x-www-form-urlencoded` format এ data পাঠায়
- এখন সেটাও support করে

### 3. ✅ Detailed Logging
- প্রতিটি webhook request এর complete details log হবে
- Debugging সহজ হবে

---

## 📝 WordPress Elementor Form Setup

### Step 1: Elementor Form Widget যোগ করুন

1. Elementor editor open করুন
2. "Form" widget drag করুন
3. Form fields customize করুন (Name, Email, Message, etc.)

### Step 2: Webhook Action যোগ করুন

1. Form widget select করুন
2. **Content Tab** → **Actions After Submit** এ যান
3. "Webhook" select করুন (অথবা add করুন)

### Step 3: Webhook URL Configure করুন

**Webhook URL** field এ paste করুন:

```
https://ses-model-dgp9.onrender.com/api/webhook
```

### Step 4: Additional Settings (Optional)

**Advanced Settings:**
- **Method:** POST
- **Content Type:** application/json (recommended) অথবা application/x-www-form-urlencoded
- **Custom Headers:** (optional, leave empty for now)

### Step 5: Field Mapping (Important!)

Elementor form fields আপনার webhook এ এভাবে যাবে:

```json
{
  "form_fields": {
    "name": "User Name",
    "email": "user@example.com",
    "message": "User message here"
  },
  "form_name": "Contact Form",
  "page_url": "https://yourwordpress.com/contact",
  "user_agent": "Mozilla/5.0...",
  "remote_ip": "123.456.789.0"
}
```

---

## 🧪 Test করার পদ্ধতি:

### Method 1: WordPress Form Submit করুন

1. আপনার WordPress site এ যান
2. Elementor form fill করুন
3. Submit করুন
4. Check করুন:
   - ✅ Form success message দেখাচ্ছে কিনা
   - ✅ Admin email এ notification এসেছে কিনা
   - ✅ Webhook logs এ entry আছে কিনা

### Method 2: Server Logs Check করুন

আপনার local server running থাকলে console এ দেখবেন:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Webhook received at: 2026-01-22T13:36:38.000Z
🌐 Origin: https://yourwordpress.com
🔗 Referer: https://yourwordpress.com/contact
📋 Content-Type: application/json
📦 Payload: {
  "form_fields": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Method 3: Render Logs Check করুন

1. যান: https://dashboard.render.com
2. আপনার service: `ses-model-dgp9` select করুন
3. "Logs" tab এ যান
4. Real-time logs দেখুন

---

## 🔍 Troubleshooting WordPress Elementor Issues

### Issue 1: "CORS Error" in Browser Console

**লক্ষণ:**
```
Access to XMLHttpRequest at 'https://ses-model-dgp9.onrender.com/api/webhook' 
from origin 'https://yourwordpress.com' has been blocked by CORS policy
```

**সমাধান:**
✅ Already fixed! আমি CORS enable করে দিয়েছি। Server restart করুন:
- Local: Terminal এ `Ctrl+C` press করে `npm run dev` আবার run করুন
- Production: Render auto-deploy হবে (2-5 minutes)

### Issue 2: "Webhook Failed" Message in Elementor

**কারণ:**
- Server sleeping (Render free tier)
- Webhook inactive
- Wrong URL

**সমাধান:**

1. **Health Check করুন:**
   ```
   https://ses-model-dgp9.onrender.com/health
   ```
   
2. **Webhook Active আছে কিনা check করুন:**
   - Admin panel → Webhook Config
   - "Active Ingestion" toggle ON করুন

3. **URL সঠিক আছে কিনা verify করুন:**
   ```
   ✅ https://ses-model-dgp9.onrender.com/api/webhook
   ❌ https://ses-model-dgp9.onrender.com/webhook (wrong)
   ```

### Issue 3: Data আসছে কিন্তু Empty/Null

**কারণ:** Field mapping issue

**সমাধান:**

Elementor form fields এর IDs check করুন:

1. Form widget → Content → Form Fields
2. প্রতিটি field এর **ID** note করুন (e.g., `name`, `email`, `message`)
3. এই IDs দিয়েই data আসবে

**Example:**
```json
{
  "form_fields": {
    "field_abc123": "Value 1",  // যদি custom ID থাকে
    "name": "John Doe",         // যদি ID "name" হয়
    "email": "john@example.com" // যদি ID "email" হয়
  }
}
```

### Issue 4: "403 Forbidden" Error

**কারণ:** Webhook disabled আছে admin panel এ

**সমাধান:**
1. Admin panel login করুন
2. Webhook Config → Active Ingestion → ON করুন
3. Save করুন

### Issue 5: WordPress Site থেকে Submit হচ্ছে না

**Check করুন:**

1. **Elementor Pro আছে কিনা:**
   - Webhook feature শুধু Elementor Pro তে available
   - Free version এ webhook নেই

2. **WordPress SSL Certificate:**
   - আপনার WordPress site HTTPS এ run করছে কিনা
   - Mixed content (HTTP → HTTPS) block হতে পারে

3. **Firewall/Security Plugins:**
   - Wordfence, Sucuri এর মত plugins outgoing requests block করতে পারে
   - Temporarily disable করে test করুন

---

## 📊 WordPress থেকে কি Data আসবে?

### Standard Elementor Webhook Payload:

```json
{
  "form_fields": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "message": "I need help with..."
  },
  "form_name": "Contact Form",
  "form_id": "12345",
  "page_id": "67",
  "page_url": "https://yourwordpress.com/contact",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "remote_ip": "123.456.789.0",
  "sent_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "message": "I need help with..."
  }
}
```

### এই data কিভাবে process হবে:

1. ✅ Webhook endpoint receive করবে
2. ✅ MongoDB এ log save করবে
3. ✅ Admin email এ notification পাঠাবে
4. ✅ Success response দেবে WordPress কে

---

## 🎨 Elementor Form Example Configuration

### Basic Contact Form:

**Form Fields:**
```
1. Name (ID: name, Type: Text, Required: Yes)
2. Email (ID: email, Type: Email, Required: Yes)
3. Phone (ID: phone, Type: Tel, Required: No)
4. Message (ID: message, Type: Textarea, Required: Yes)
```

**Actions After Submit:**
```
✅ Webhook
   URL: https://ses-model-dgp9.onrender.com/api/webhook
   
✅ Email (optional - WordPress এও email পাঠাতে পারেন)
   To: admin@yoursite.com
   
✅ Redirect (optional - success page এ redirect করতে পারেন)
   URL: /thank-you
```

**Form Options:**
```
✅ Show Success Message: Yes
   Message: "Thank you! We'll contact you soon."
   
✅ Hide Form After Submit: Yes (optional)

✅ Required Field Indicator: Yes
```

---

## 🔐 Security Best Practices

### 1. Webhook Validation (Optional - Future Enhancement)

আপনি চাইলে webhook validation যোগ করতে পারেন:

```javascript
// server/index.js এ webhook endpoint এ
const validateWebhook = (req) => {
  // Check if request is from your WordPress site
  const allowedOrigins = [
    'https://yourwordpress.com',
    'https://www.yourwordpress.com'
  ];
  
  const origin = req.headers.origin || req.headers.referer;
  return allowedOrigins.some(allowed => origin?.includes(allowed));
};
```

### 2. Rate Limiting

Production এ rate limiting যোগ করুন:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50 // 50 requests per minute per IP
});

app.post('/api/webhook', webhookLimiter, async (req, res) => {
  // ...
});
```

### 3. Spam Protection

Elementor Pro এ built-in spam protection আছে:
- Google reCAPTCHA enable করুন
- Honeypot field যোগ করুন

---

## ✅ Success Checklist

WordPress Elementor webhook ঠিকমতো কাজ করছে কিনা:

- [ ] ✅ Elementor Pro installed এবং active
- [ ] ✅ Form created with webhook action
- [ ] ✅ Webhook URL সঠিক: `https://ses-model-dgp9.onrender.com/api/webhook`
- [ ] ✅ Server deployed এবং running
- [ ] ✅ CORS enabled (আমি করে দিয়েছি)
- [ ] ✅ Webhook active in admin panel
- [ ] ✅ Form submit করলে success message আসে
- [ ] ✅ Admin email এ notification আসে
- [ ] ✅ Webhook logs এ entry দেখা যায়
- [ ] ✅ Server logs এ webhook data দেখা যায়

---

## 🚀 Next Steps

### 1. Server Restart করুন (Local Development)

Terminal এ:
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### 2. Production Deploy করুন

```bash
git add server/index.js
git commit -m "fix: Enable CORS for WordPress Elementor webhook integration"
git push origin main
```

Render auto-deploy করবে (2-5 minutes)

### 3. WordPress Form Test করুন

1. WordPress site এ যান
2. Form submit করুন
3. Success message দেখুন
4. Admin email check করুন
5. Webhook logs check করুন

---

## 📧 Email Notification Format

WordPress form submit হলে admin এই email পাবেন:

**Subject:** 🔔 New Webhook Data Received

**Body:**
```
A new webhook was triggered at 22/01/2026, 1:36:38 PM

Payload Data:
{
  "form_fields": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I need help with..."
  },
  "form_name": "Contact Form",
  "page_url": "https://yourwordpress.com/contact"
}
```

---

## 💡 Pro Tips

1. **Test First:** Production এ use করার আগে test form দিয়ে test করুন

2. **Monitor Logs:** প্রথম কিছুদিন regularly logs check করুন

3. **Backup Email:** WordPress email notification ও enable রাখুন backup হিসেবে

4. **Custom Fields:** Elementor এ custom fields যোগ করতে পারেন (dropdown, checkbox, etc.)

5. **Conditional Logic:** Elementor Pro তে conditional logic use করতে পারেন

---

## 🎉 সব ঠিক হয়ে গেছে!

এখন আপনার WordPress Elementor form থেকে data সরাসরি আপনার SES Service webhook এ আসবে!

**Webhook URL:**
```
https://ses-model-dgp9.onrender.com/api/webhook
```

কোন সমস্যা হলে বা আরও help লাগলে জানাবেন! 😊

---

Made with ❤️ for WordPress + SES Service Integration
