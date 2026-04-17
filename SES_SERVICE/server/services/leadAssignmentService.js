const User = require('../models/User');

/**
 * Assigns a lead to an active sales agent using round-robin logic
 * based on the lowest current leadCount.
 */
const assignLead = async (lead) => {
  try {
    // Find active agent with the least leads
    const agent = await User.findOne({ role: 'sales_agent', isActive: true }).sort({ leadCount: 1 });
    
    if (agent) {
      lead.assignedTo = agent._id;
      agent.leadCount = (agent.leadCount || 0) + 1;
      await agent.save({ validateBeforeSave: false }); // Skip validation just in case
      return agent;
    }
    
    return null; // No agents available
  } catch (error) {
    console.error('Error assigning lead:', error);
    return null;
  }
};

module.exports = {
  assignLead,
};
