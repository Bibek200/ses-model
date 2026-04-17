const Lead = require('../models/Lead');
const { success, created, error, notFound, badRequest } = require('../utils/apiResponse');
const { assignLead } = require('../services/leadAssignmentService');
const { sendTextMessage } = require('../services/whatsappService');

/**
 * @desc    Get all leads (with role-based filtering)
 * @route   GET /api/crm/leads
 */
const getLeads = async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Sales agents can only see their own leads
    if (req.user.role === 'sales_agent') {
      query.assignedTo = req.user._id;
    }

    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    return success(res, {
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Create a new lead
 * @route   POST /api/crm/leads
 */
const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);

    // Auto-assign if no agent specified
    if (!lead.assignedTo) {
      await assignLead(lead);
    }

    await lead.save();

    // Trigger WhatsApp welcome if they opted in or provided phone
    if (lead.phone && lead.whatsappOptIn) {
      const msg = `Hi ${lead.name}, welcome to Nexus! A sales representative will be in touch shortly.`;
      await sendTextMessage(lead.phone, msg);
    }

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');

    return created(res, { lead: populatedLead }, 'Lead created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Get a single lead by ID
 * @route   GET /api/crm/leads/:id
 */
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('pipeline');

    if (!lead) return notFound(res, 'Lead not found');

    // Access check
    if (req.user.role === 'sales_agent' && String(lead.assignedTo._id) !== String(req.user._id)) {
      return error(res, 'Not authorized to view this lead', 403);
    }

    return success(res, { lead });
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Update a lead
 * @route   PUT /api/crm/leads/:id
 */
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return notFound(res, 'Lead not found');

    // Access check
    if (req.user.role === 'sales_agent' && String(lead.assignedTo) !== String(req.user._id)) {
      return error(res, 'Not authorized to update this lead', 403);
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar');

    return success(res, { lead: updatedLead }, 'Lead updated');
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Delete a lead
 * @route   DELETE /api/crm/leads/:id
 */
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return notFound(res, 'Lead not found');

    // Access check - only admins can delete or the agent who owns it (if permitted)
    if (req.user.role === 'sales_agent' && String(lead.assignedTo) !== String(req.user._id)) {
      return error(res, 'Not authorized to delete this lead', 403);
    }

    await lead.deleteOne();
    return success(res, null, 'Lead deleted');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead
};
