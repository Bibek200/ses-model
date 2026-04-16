const { sendEmail } = require('../utils/sendEmail');

const sendEmailEndpoint = async (req, res) => {
  try {
    const { recipientEmail, subject, html } = req.body;

    // Just send email, don't save to DB
    await sendEmail(recipientEmail, subject, html);

    res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

module.exports = {
  sendEmailEndpoint
};
