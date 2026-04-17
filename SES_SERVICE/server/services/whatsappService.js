/**
 * WhatsApp Meta Cloud API Service
 */

const sendTextMessage = async (phone, message) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.log('📱 [MOCK WHATSAPP]', { phone, message });
    return { success: true, mocked: true };
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
    // We assume native fetch is available (Node >= 18)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }
    
    return data;
  } catch (err) {
    console.error('WhatsApp Error:', err);
    throw err;
  }
};

module.exports = {
  sendTextMessage,
};
