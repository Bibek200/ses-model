const Pipeline = require('../models/Pipeline');
const Lead = require('../models/Lead');
const { success, created, error, notFound } = require('../utils/apiResponse');

/**
 * @desc    Get all pipelines
 * @route   GET /api/crm/pipelines
 */
const getPipelines = async (req, res) => {
  try {
    const pipelines = await Pipeline.find().sort({ createdAt: -1 });
    return success(res, { pipelines });
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Get leads in a specific pipeline (for Kanban)
 * @route   GET /api/crm/pipelines/:id/leads
 */
const getPipelineLeads = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return notFound(res, 'Pipeline not found');

    const leads = await Lead.find({ pipeline: req.params.id })
      .populate('assignedTo', 'name email avatar');

    // Group leads by stage
    const kanbanData = pipeline.stages.map(stage => ({
      stage: stage.name,
      leads: leads.filter(l => l.pipelineStage === stage.name)
    }));

    return success(res, { kanbanData, pipeline });
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Create a new pipeline
 * @route   POST /api/crm/pipelines
 */
const createPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.create({
      ...req.body,
      createdBy: req.user._id
    });
    return created(res, { pipeline }, 'Pipeline created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Move a lead to a different stage in a pipeline
 * @route   PUT /api/crm/pipelines/leads/:leadId/stage
 */
const moveStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.leadId, { pipelineStage: stage }, { new: true });
    if (!lead) return notFound(res, 'Lead not found');
    return success(res, { lead }, `Lead moved to ${stage}`);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getPipelines,
  getPipelineLeads,
  createPipeline,
  moveStage,
};
