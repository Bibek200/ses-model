const { WebhookConfig, WebhookLog, Inquiry } = require('../models');
const { sendEmail } = require('../utils/sendEmail');
const appState = require('../config/state');

const receiveWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const timestamp = new Date();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Webhook received at:', timestamp.toISOString());
    console.log('🌐 Origin:', req.headers.origin || 'No origin header');
    console.log('🔗 Referer:', req.headers.referer || 'No referer');
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📦 Payload:', JSON.stringify(webhookData, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let config = appState.fallbackData.webhookConfig;
    if (appState.isMongoConnected) {
      const mongoConfig = await WebhookConfig.findOne();
      if (mongoConfig) {
        config = { email: mongoConfig.email, domain: mongoConfig.domain, isActive: mongoConfig.isActive };
      }
    }

    if (!config.isActive) {
      console.log('⚠️  Webhook is disabled');
      return res.status(403).json({
        success: false,
        error: 'Webhook is currently disabled'
      });
    }

    if (appState.isMongoConnected) {
      const log = new WebhookLog({
        payload: webhookData,
        receivedAt: timestamp,
        status: 'success'
      });
      await log.save();
      console.log('✅ Webhook log saved to database');
    } else {
      appState.fallbackData.webhookLogs.unshift({
        id: Date.now().toString(),
        payload: webhookData,
        receivedAt: timestamp.toISOString(),
        status: 'success',
        error: null
      });
      console.log('✅ Webhook log saved to fallback data');
    }

    try {
      let fields = webhookData;
      if (webhookData.form_fields) fields = webhookData.form_fields;
      else if (webhookData.fields) fields = webhookData.fields;
      else if (webhookData.data) fields = webhookData.data;

      const extractValue = (field) => {
        if (!field) return null;
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field.value !== undefined) return String(field.value);
        return null;
      };

      const isFieldMatch = (key, field, keywords) => {
        if (['form', 'meta', 'fields'].includes(key.toLowerCase())) return false;
        const searchKeys = Array.isArray(keywords) ? keywords : [keywords];
        const lowerKey = key.toLowerCase();
        if (searchKeys.some(k => lowerKey.includes(k.toLowerCase()))) return true;
        if (typeof field === 'object' && field.title) {
          const lowerTitle = field.title.toLowerCase();
          if (searchKeys.some(k => lowerTitle.includes(k.toLowerCase()))) return true;
        }
        return false;
      };

      const isContentMatch = (field, type) => {
        const val = extractValue(field);
        if (!val) return false;
        if (type === 'email' && val.includes('@') && val.includes('.')) return true;
        return false;
      };

      let name = null;
      let email = null;
      let message = null;

      for (const [key, field] of Object.entries(fields)) {
        if (key === 'form' || key === 'meta') continue;
        if (!email && (isFieldMatch(key, field, ['email', 'mail', 'e-mail']) || isContentMatch(field, 'email'))) {
          email = extractValue(field);
          continue;
        }
        if (!name && isFieldMatch(key, field, ['name', 'fullname', 'user', 'first_name', 'client'])) {
          name = extractValue(field);
          continue;
        }
        if (!message && isFieldMatch(key, field, ['message', 'msg', 'comment', 'query', 'body', 'text'])) {
          message = extractValue(field);
          continue;
        }
      }

      const fieldValues = Object.entries(fields)
        .filter(([k]) => k !== 'form' && k !== 'meta')
        .map(([, v]) => extractValue(v))
        .filter(v => v);

      if (!email) {
        email = fieldValues.find(v => v.includes('@') && v.includes('.'));
      }

      if (email) {
        if (!name) {
          const potentialNames = fieldValues.filter(v => v !== email && v !== message && v.length < 50);
          if (potentialNames.length > 0) name = potentialNames[0];
          else name = email.split('@')[0];
        }

        if (!message) {
          const potentialMessages = fieldValues.filter(v => v !== email && v !== name);
          if (potentialMessages.length > 0) {
            message = potentialMessages.sort((a, b) => b.length - a.length)[0];
          } else {
            message = 'Message received via Webhook';
          }
        }

        if (appState.isMongoConnected) {
          const newInquiry = new Inquiry({
            name: String(name),
            email: String(email),
            message: String(message),
            date: new Date().toISOString().split('T')[0],
            status: 'new'
          });
          await newInquiry.save();
        } else {
          appState.fallbackData.inquiries.unshift({
            id: Date.now().toString(),
            name: String(name),
            email: String(email),
            message: String(message),
            date: new Date().toISOString().split('T')[0],
            status: 'new'
          });
        }
        console.log('✨ Webhook automatically converted to Inquiry');
      }
    } catch (conversionError) {
      console.error('⚠️ Failed to convert webhook to inquiry:', conversionError);
    }

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
    }

    res.json({
      success: true,
      message: 'Webhook received and processed successfully',
      timestamp: timestamp.toISOString(),
      dataReceived: Object.keys(webhookData).length > 0
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    if (appState.isMongoConnected) {
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
    } else {
      appState.fallbackData.webhookLogs.unshift({
        id: Date.now().toString(),
        payload: req.body,
        receivedAt: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
};

const getWebhookLogs = async (req, res) => {
  try {
    let logs = [];
    if (appState.isMongoConnected) {
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
    } else {
      logs = appState.fallbackData.webhookLogs.slice(0, 50);
    }
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Failed to fetch webhook logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

const getWebhookConfig = async (req, res) => {
  try {
    let config = appState.fallbackData.webhookConfig;
    if (appState.isMongoConnected) {
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
};

const updateWebhookConfig = async (req, res) => {
  try {
    const { email, domain, isActive } = req.body;
    appState.fallbackData.webhookConfig = { email, domain, isActive };
    if (appState.isMongoConnected) {
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
};

module.exports = {
  receiveWebhook,
  getWebhookLogs,
  getWebhookConfig,
  updateWebhookConfig
};
