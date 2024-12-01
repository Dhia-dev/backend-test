const Product = require('../models/product.model');

exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      imageUrl: req.file?.path
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      ...(req.file && { imageUrl: req.file.path })
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rateProduct = async (req, res) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const ratingIndex = product.ratings.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (ratingIndex >= 0) {
      // Update existing rating
      product.ratings[ratingIndex].rating = rating;
    } else {
      // Add new rating
      product.ratings.push({
        userId: req.user._id,
        rating
      });
    }
   await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeRating = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const ratingIndex = product.ratings.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (ratingIndex === -1) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    product.ratings.splice(ratingIndex, 1);

    if (product.ratings.length > 0) {
      const totalRating = product.ratings.reduce((sum, r) => sum + r.rating, 0);
      product.averageRating = totalRating / product.ratings.length;
    } else {
      product.averageRating = 0;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};