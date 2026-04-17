const Product = require('../models/Product');
const { success, created, error, notFound } = require('../utils/apiResponse');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    return success(res, { products });
  } catch (err) {
    return error(res, err.message);
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return created(res, { product }, 'Product added to inventory');
  } catch (err) {
    return error(res, err.message);
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { $inc: { stockQuantity: quantity } }, 
      { new: true }
    );
    if (!product) return notFound(res, 'Product not found');
    return success(res, { product }, 'Stock updated');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getProducts, createProduct, updateStock };
