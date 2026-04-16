const { Inquiry } = require('../models');
const appState = require('../config/state');

const createInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    let savedInquiry = null;

    if (appState.isMongoConnected) {
      const inquiry = new Inquiry({ name, email, message, status: 'new' });
      savedInquiry = await inquiry.save();
    } else {
      savedInquiry = { id: Date.now().toString(), name, email, message, date: new Date().toISOString().split('T')[0], status: 'new' };
      appState.fallbackData.inquiries.unshift(savedInquiry);
    }
    res.json({ success: true, data: savedInquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
};

const getInquiries = async (req, res) => {
  try {
    let inquiries = [];
    if (appState.isMongoConnected) {
      inquiries = await Inquiry.find().sort({ createdAt: -1 });
      inquiries = inquiries.map(inq => ({ id: inq._id.toString(), name: inq.name, email: inq.email, message: inq.message, date: inq.date, status: inq.status }));
    } else {
      inquiries = appState.fallbackData.inquiries;
    }
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (appState.isMongoConnected) {
      await Inquiry.findByIdAndDelete(id);
    } else {
      appState.fallbackData.inquiries = appState.fallbackData.inquiries.filter(i => i.id !== id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (appState.isMongoConnected) {
      await Inquiry.findByIdAndUpdate(id, { status });
    } else {
      appState.fallbackData.inquiries = appState.fallbackData.inquiries.map(i => i.id === id ? { ...i, status } : i);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  deleteInquiry,
  updateStatus
};
