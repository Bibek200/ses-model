const mongoose = require('mongoose');
const appState = require('./state');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        appState.isMongoConnected = true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️  Using fallback mode without database');
        appState.isMongoConnected = false;
    }
};

module.exports = connectDB;
