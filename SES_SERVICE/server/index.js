const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { sendEmail } = require('./sendEmail');
const { Inquiry, WebhookConfig, WebhookLog } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let isMongoConnected = false;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    isMongoConnected = true;
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Using fallback mode without database');
    isMongoConnected = false;
  });

// Fallback in-memory storage
const fallbackData = {
  inquiries: [
    { id: '1', name: 'Rahim Ahmed', email: 'rahim@test.com', message: 'I need help with the webhook integration documentation.', date: '2023-10-24', status: 'new' },
    { id: '2', name: 'Sarah Khan', email: 'sarah.k@business.com', message: 'Pricing inquiry for enterprise plan.', date: '2023-10-23', status: 'read' }
  ],
  webhookConfig: {
    email: 'admin@nexus.com',
    domain: 'https://api.nexus.com/v1/webhook',
    isActive: true
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true, user: { id: '2', name: 'Admin User', role: 'admin', email: email } });
    }
    if (email === process.env.VIEWER_EMAIL && password === process.env.VIEWER_PASSWORD) {
      return res.json({ success: true, user: { id: '1', name: 'Viewer User', role: 'viewer', email: email } });
    }
    res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create Inquiry Endpoint (New)
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    let savedInquiry = null;

    if (isMongoConnected) {
      const inquiry = new Inquiry({ name, email, message, status: 'new' });
      savedInquiry = await inquiry.save();
    } else {
      savedInquiry = { id: Date.now().toString(), name, email, message, date: new Date().toISOString().split('T')[0], status: 'new' };
      fallbackData.inquiries.unshift(savedInquiry);
    }
    res.json({ success: true, data: savedInquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
});

// Send Email Endpoint (Purely for emailing)
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientEmail, subject, html } = req.body;

    // Just send email, don't save to DB
    await sendEmail(recipientEmail, subject, html);

    res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Get Inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    let inquiries = [];
    if (isMongoConnected) {
      inquiries = await Inquiry.find().sort({ createdAt: -1 });
      inquiries = inquiries.map(inq => ({ id: inq._id.toString(), name: inq.name, email: inq.email, message: inq.message, date: inq.date, status: inq.status }));
    } else {
      inquiries = fallbackData.inquiries;
    }
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Delete Inquiry
app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Inquiry.findByIdAndDelete(id);
    } else {
      fallbackData.inquiries = fallbackData.inquiries.filter(i => i.id !== id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Update Status
app.patch('/api/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (isMongoConnected) {
      await Inquiry.findByIdAndUpdate(id, { status });
    } else {
      fallbackData.inquiries = fallbackData.inquiries.map(i => i.id === id ? { ...i, status } : i);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Webhook Receiver Endpoint - Receives data from external services
app.post('/api/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    const timestamp = new Date();

    console.log('📥 Webhook received:', JSON.stringify(webhookData, null, 2));

    // Get webhook config to check if active and get admin email
    let config = fallbackData.webhookConfig;
    if (isMongoConnected) {
      const mongoConfig = await WebhookConfig.findOne();
      if (mongoConfig) {
        config = { email: mongoConfig.email, domain: mongoConfig.domain, isActive: mongoConfig.isActive };
      }
    }

    // Check if webhook is active
    if (!config.isActive) {
      console.log('⚠️  Webhook is disabled');
      return res.status(403).json({
        success: false,
        error: 'Webhook is currently disabled'
      });
    }

    // Save webhook log
    if (isMongoConnected) {
      const log = new WebhookLog({
        payload: webhookData,
        receivedAt: timestamp,
        status: 'success'
      });
      await log.save();
      console.log('✅ Webhook log saved to database');
    }

    // Send email notification to admin
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4F46E5; margin-bottom: 20px;">🔔 New Webhook Data Received</h2>
            <p style="color: #666; margin-bottom: 15px;">A new webhook was triggered at ${timestamp.toLocaleString()}</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #4F46E5;">
              <h3 style="margin-top: 0; color: #333;">Payload Data:</h3>
              <pre style="background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px;">${JSON.stringify(webhookData, null, 2)}</pre>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #999; font-size: 12px; margin: 0;">This is an automated notification from your SES Service webhook system.</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail(
        config.email,
        '🔔 New Webhook Data Received',
        emailHtml
      );
      console.log('✅ Email notification sent to:', config.email);
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError);
      // Don't fail the webhook if email fails
    }

    // Return success response
    res.json({
      success: true,
      message: 'Webhook received and processed successfully',
      timestamp: timestamp.toISOString(),
      dataReceived: Object.keys(webhookData).length > 0
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // Log failed webhook attempt
    if (isMongoConnected) {
      try {
        const log = new WebhookLog({
          payload: req.body,
          receivedAt: new Date(),
          status: 'failed',
          error: error.message
        });
        await log.save();
      } catch (logError) {
        console.error('Failed to log webhook error:', logError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

// Alternative endpoint path for /v1/webhook
app.post('/v1/webhook', async (req, res) => {
  // Redirect to main webhook handler
  req.url = '/api/webhook';
  return app._router.handle(req, res);
});

// Get Webhook Logs
app.get('/api/webhook-logs', async (req, res) => {
  try {
    let logs = [];
    if (isMongoConnected) {
      logs = await WebhookLog.find()
        .sort({ receivedAt: -1 })
        .limit(50);
      logs = logs.map(log => ({
        id: log._id.toString(),
        payload: log.payload,
        receivedAt: log.receivedAt,
        status: log.status,
        error: log.error
      }));
    }
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Failed to fetch webhook logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Webhook Config
app.get('/api/webhook-config', async (req, res) => {
  try {
    let config = fallbackData.webhookConfig;
    if (isMongoConnected) {
      let mongoConfig = await WebhookConfig.findOne();
      if (!mongoConfig) {
        mongoConfig = new WebhookConfig({ email: 'admin@nexus.com', domain: 'https://api.nexus.com/v1/webhook', isActive: true });
        await mongoConfig.save();
      }
      config = { email: mongoConfig.email, domain: mongoConfig.domain, isActive: mongoConfig.isActive };
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/webhook-config', async (req, res) => {
  try {
    const { email, domain, isActive } = req.body;
    fallbackData.webhookConfig = { email, domain, isActive };
    if (isMongoConnected) {
      let config = await WebhookConfig.findOne();
      if (!config) config = new WebhookConfig();
      config.email = email;
      config.domain = domain;
      config.isActive = isActive;
      await config.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
