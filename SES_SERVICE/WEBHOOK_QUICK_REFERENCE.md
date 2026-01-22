# 🚀 Webhook Quick Reference

## 📍 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhook` | POST | Receive webhook data |
| `/v1/webhook` | POST | Alternative webhook path |
| `/api/webhook-logs` | GET | Get webhook logs |
| `/api/webhook-config` | GET | Get webhook config |
| `/api/webhook-config` | POST | Update webhook config |

## 🧪 Quick Test Commands

### Node.js Test:
```bash
node test-webhook.js
```

### PowerShell (if enabled):
```powershell
.\test-webhook.ps1
```

### Using Invoke-WebRequest (PowerShell):
```powershell
$body = @{
    event = "test"
    data = @{
        name = "Test User"
        email = "test@example.com"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/webhook" -Method Post -Body $body -ContentType "application/json"
```

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Webhook received and processed successfully",
  "timestamp": "2026-01-22T13:17:23.000Z",
  "dataReceived": true
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Webhook is currently disabled"
}
```

## 🔍 Check Server Status

```bash
# Health check
curl http://localhost:5001/health

# Get webhook config
curl http://localhost:5001/api/webhook-config

# Get webhook logs
curl http://localhost:5001/api/webhook-logs
```

## 📧 Email Notification

প্রতিটি webhook receive হলে admin email এ notification যাবে:

- **Subject:** 🔔 New Webhook Data Received
- **Content:** Complete payload with timestamp
- **Format:** HTML formatted email

## 🎯 Common Payloads

### Minimal:
```json
{
  "event": "test"
}
```

### Standard:
```json
{
  "event": "user.action",
  "data": {
    "userId": "123",
    "action": "signup"
  }
}
```

### Complete:
```json
{
  "event": "payment.success",
  "timestamp": "2026-01-22T13:17:23Z",
  "data": {
    "orderId": "ORD123",
    "amount": 1000,
    "currency": "BDT",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "metadata": {
    "source": "payment-gateway",
    "version": "1.0"
  }
}
```

## 🔧 Troubleshooting Checklist

- [ ] Server running? → `curl http://localhost:5001/health`
- [ ] MongoDB connected? → Check server console
- [ ] Webhook active? → Check admin panel
- [ ] Email configured? → Check `.env` file
- [ ] Correct URL? → Verify endpoint path

## 🌐 Production URLs

| Environment | Webhook URL |
|-------------|-------------|
| Local | `http://localhost:5001/api/webhook` |
| Staging | `https://staging.yourdomain.com/api/webhook` |
| Production | `https://yourdomain.com/api/webhook` |

---

**💡 Tip:** Keep this file handy for quick reference!
