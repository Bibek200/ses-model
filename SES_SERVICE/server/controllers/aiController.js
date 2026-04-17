const Lead = require('../models/Lead');
const { success, error } = require('../utils/apiResponse');

/**
 * Simple AI Lead Scoring logic (Phase 4 Placeholder for Gemini integration)
 * In a real scenario, this would call the Gemini API with lead data.
 */
const scoreLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return error(res, 'Lead not found', 404);

    // Mock AI logic: Score based on data completeness and source
    let score = 50;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.source === 'webhook') score += 15;
    if (lead.status === 'qualified') score += 15;

    lead.score = score;
    await lead.save();

    return success(res, { score, lead }, 'Lead scored via AI');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { scoreLead };
