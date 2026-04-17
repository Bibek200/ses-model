const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection + Seed
const User = require('./models/User');

async function seedSuperAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    const email = process.env.ADMIN_EMAIL || 'admin@nexus.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email,
        password,
        role: 'super_admin',
        isActive: true,
      });
      console.log(`🔐 Super admin seeded: ${email} / ${password} (New)`);
    } else {
      // Force update password and activation
      existingAdmin.password = password;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`ℹ️ Super admin existed. Password reset and account RE-ACTIVATED: ${email}`);
    }
  } catch (err) {
    console.error('⚠️  Critical seeding error:', err);
  }
}

// Routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

// Start Server
connectDB().then(() => {
  seedSuperAdmin();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
