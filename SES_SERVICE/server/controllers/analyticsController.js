const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Get aggregate analytics data
 * @route   GET /api/crm/analytics/overview
 */
const getOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    
    const customersCount = await Customer.countDocuments();
    
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Lead source distribution
    const sourceData = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return success(res, {
      stats: {
        totalLeads,
        newLeads,
        customersCount,
        totalRevenue
      },
      sourceDistribution: sourceData,
      monthlyRevenue
    });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getOverview };
