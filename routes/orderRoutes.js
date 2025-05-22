const express = require('express');
const { createOrder, getOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (if any, though typically orders are protected)
// router.get('/', getProducts); // Example: if you had a public listing of orders (unlikely)

// Protected routes
router.post('/', protect, createOrder); // Create order (any logged-in user)
router.get('/my-orders', protect, getMyOrders); // Get orders for the logged-in user
router.get('/:id', protect, getOrder); // Get a specific order by ID (user can get their own, admin can get any)

// Admin-only routes
router.get('/', protect, adminOnly, getAllOrders); // Get all orders (admin only) - this is the one that was causing 403
router.put('/:id', protect, adminOnly, updateOrderStatus); // Update order status (admin only)

module.exports = router;
