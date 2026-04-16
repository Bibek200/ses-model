const appState = {
  isMongoConnected: false,
  fallbackData: {
    inquiries: [
      { id: '1', name: 'Rahim Ahmed', email: 'rahim@test.com', message: 'I need help with the webhook integration documentation.', date: '2023-10-24', status: 'new' },
      { id: '2', name: 'Sarah Khan', email: 'sarah.k@business.com', message: 'Pricing inquiry for enterprise plan.', date: '2023-10-23', status: 'read' }
    ],
    webhookConfig: {
      email: 'admin@nexus.com',
      domain: 'https://api.nexus.com/v1/webhook',
      isActive: true
    },
    webhookLogs: []
  }
};

module.exports = appState;
