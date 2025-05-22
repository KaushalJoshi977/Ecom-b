const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create a new order
const createOrder = async (req, res) => {
    const { userEmail, products } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate products, get their IDs, and calculate total amount
        let totalAmount = 0;
        const productIds = [];
        for (const item of products) {
            const product = await Product.findOne({ name: item.productName });
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productName}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }
            productIds.push({ product: product._id, quantity: item.quantity });
            totalAmount += product.price * item.quantity; // Calculate total amount
        }

        // Create the order
        const order = await Order.create({
            user: user._id,
            products: productIds,
            totalAmount, // Use calculated total amount
        });

        // Decrease product stock
        for (const item of productIds) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get order by ID (can be used by user to get their specific order, or admin)
const getOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user can only view their own order unless they are admin
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all orders (Admin Only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email') // Populate user details
            .populate('products.product', 'name price'); // Populate product details
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get orders for the logged-in user
const getMyOrders = async (req, res) => {
    try {
        // req.user._id is set by the protect middleware based on the JWT token
        const orders = await Order.find({ user: req.user.id })
            .populate('products.product', 'name price'); // Populate product details
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Update order status (Admin Only)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { createOrder, getOrder, getAllOrders, getMyOrders, updateOrderStatus };
