const express = require('express');
const { getProducts, createProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, adminOnly, createProduct);

module.exports = router;