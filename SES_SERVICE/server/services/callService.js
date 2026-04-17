/**
 * Voice Call Service (Twilio Architecture)
 */

const makeCall = async (to, from) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log('☎️ [MOCK CALL]', { from, to });
    return { success: true, mocked: true };
  }

  try {
    // This would use the twilio npm package or native fetch to Meta/Twilio API
    console.log(`Initiating call from ${from} to ${to}...`);
    return { success: true, sid: 'mock_sid_' + Date.now() };
  } catch (err) {
    console.error('Call Error:', err);
    throw err;
  }
};

module.exports = { makeCall };
