const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { success, created, error, notFound } = require('../utils/apiResponse');

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email company')
      .sort({ createdAt: -1 });
    return success(res, { orders });
  } catch (err) {
    return error(res, err.message);
  }
};

const createOrder = async (req, res) => {
  try {
    // Basic order number generation: ORD-timestamp
    const orderNumber = `ORD-${Date.now()}`;
    const order = await Order.create({ ...req.body, orderNumber });
    
    // Update customer revenue
    if (order.paymentStatus === 'paid') {
      await Customer.findByIdAndUpdate(order.customer, {
        $inc: { totalRevenue: order.totalAmount, totalOrders: 1 }
      });
    }

    return created(res, { order }, 'Order created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return notFound(res, 'Order not found');
    return success(res, { order }, `Order status updated to ${status}`);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
