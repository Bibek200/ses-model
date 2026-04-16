const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trigger redeploy - Fix WebhookLog schema validation issue
// Middleware - Enhanced CORS for WordPress Elementor and external webhooks
app.use(cors({
  origin: '*', // Allow all origins (WordPress, Elementor, external services)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
connectDB();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', version: '1.0.9' });
});

// App routing
app.use('/api', routes);

// Alternative endpoint path for /v1/webhook
app.post('/v1/webhook', async (req, res) => {
  // Redirect to main webhook handler
  req.url = '/api/webhook';
  return app._router.handle(req, res);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
