const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { success, created, error, notFound } = require('../utils/apiResponse');

/**
 * @desc    Get all customers
 * @route   GET /api/crm/customers
 */
const getCustomers = async (req, res) => {
  try {
    const { status, company, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter by role if needed (e.g., agents see only their assigned customers)
    if (req.user.role === 'sales_agent') {
      query.assignedTo = req.user._id;
    }

    if (status) query.status = status;
    if (company) query.company = { $regex: company, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    return success(res, {
      customers,
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
 * @desc    Get a single customer
 * @route   GET /api/crm/customers/:id
 */
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('convertedFrom');

    if (!customer) return notFound(res, 'Customer not found');

    return success(res, { customer });
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Create a new customer
 * @route   POST /api/crm/customers
 */
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    return created(res, { customer }, 'Customer created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

/**
 * @desc    Update a customer
 * @route   PUT /api/crm/customers/:id
 */
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return notFound(res, 'Customer not found');
    return success(res, { customer }, 'Customer updated successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
};
