const Product = require('../models/Product');

// Get All Products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Create Product (Admin Only)
const createProduct = async (req, res) => {
    const { name, description, price, category, stock, image } = req.body;
    try {
        const product = await Product.create({ name, description, price, category, stock, image });
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getProducts, createProduct };