const express = require('express');
const { 
    createProduct, 
    getProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct, 
    rateProduct,
    removeRating 
} = require('../controllers/product.controller');
const { auth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validateProduct } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/', auth, upload.single('imageUrl'), validateProduct, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', auth, upload.single('imageUrl'), validateProduct, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.post('/:id/rate', auth, rateProduct);
router.delete('/:id/rate', auth, removeRating);

module.exports = router;