const login = async (req, res) => {
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
};

module.exports = {
  login
};
