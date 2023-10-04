const Product = require("../modals/product");
const mongoose = require('mongoose');
const shortid = require("shortid");
const slugify = require("slugify");
const Category = require("../modals/category");
const Review=require("../modals/recentReview")

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      type,
      price,
      size,
      color,
      about,
      quantity,
      description,
      specification,
      offer,
      category,
    } = req.body;

    let productPictures = [];

    if (req.files && req.files.length > 0) {
      productPictures = req.files.map((file) => ({ img: file.filename }));
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find or create the category by name
    let categoryObjectId;

    const existingCategory = await Category.findOne({ name: category });

    if (existingCategory) {
      categoryObjectId = existingCategory._id;
    } else {
      const newCategory = new Category({ name: category });
      const savedCategory = await newCategory.save();
      categoryObjectId = savedCategory._id;
    }

    const slug = slugify(name);

    const product = new Product({
      name,
      brand,
      type,
      slug,
      price,
      size,
      color,
      about,
      quantity,
      description,
      specification,
      offer,
      productPictures,
      category: categoryObjectId,
      createdBy: req.user._id,
    });

    const savedProduct = await product.save();

    if (!savedProduct) {
      return res.status(500).json({ error: 'Failed to create product' });
    }

    res.status(201).json({ product: savedProduct, files: req.files });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getProductsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).select('_id type');
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    let productsQuery = Product.find({ category: category._id });
    const { brandName, productColor } = req.query;
    if (brandName) {
      productsQuery = productsQuery.where('brand').equals(brandName);
    }
    if (productColor) {
      productsQuery = productsQuery.where('color').equals(productColor);
    }
    const products = await productsQuery.exec();

    if (products.length === 0) {
      return res.status(200).json({ products });
    }
    res.status(200).json({
      products,
      priceRange: {
        under5k: 5000,
        under10k: 10000,
        under15k: 15000,
        under20k: 20000,
        under30k: 30000,
      },
      productsByPrice: {
        under5k: products.filter((product) => product.price <= 5000),
        under10k: products.filter(
          (product) => product.price > 5000 && product.price <= 10000
        ),
        under15k: products.filter(
          (product) => product.price > 10000 && product.price <= 15000
        ),
        under20k: products.filter(
          (product) => product.price > 15000 && product.price <= 20000
        ),
        under30k: products.filter(
          (product) => product.price > 20000 && product.price <= 30000
        ),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (req.user) {
      const userId = req.user._id;
      const existingReview = await Review.findOne({ user: userId, product: productId });

      if (!existingReview) {
        await Review.create({
          user: userId,
          product: productId,
        });
      }
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// new update

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if the provided productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if the authenticated user is the creator of the product
    if (req.user && req.user._id.equals(product.createdBy)) {
      // Delete the product if the user is the creator
      await product.remove();
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      // Unauthorized if the user is not the creator
      res.status(401).json({ error: 'Unauthorized to delete this product' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, price, description, category, quantity } = req.body;
    let productPictures = [];

    // Check if the provided productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!req.user || !req.user._id.equals(product.createdBy)) {
      return res.status(401).json({ error: 'Unauthorized to update this product' });
    }

    if (req.files && req.files.length > 0) {
      productPictures = req.files.map((file) => {
        return { img: file.filename };
      });
    }

    // Update product properties
    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.quantity = quantity;
    product.productPictures = productPictures;

    const updatedProduct = await product.save();

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


exports.getProducts = async (req, res) => {
  try {
    let products;
    if (req.user && req.user._id) {
      products = await Product.find({ createdBy: req.user._id })
        .select('_id name price quantity slug description productPictures category')
        .populate({ path: 'category', select: '_id name' })
        .exec();
    } else {
      
      products = await Product.find()
        .select('_id name price quantity slug description productPictures category')
        .populate({ path: 'category', select: '_id name' })
        .exec();
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const priceRanges = {
  0: { min: 100, max: 500 },
  1: { min: 500, max: 1000 },
  2: { min: 1000, max: 2000 },
  3: { min: 2000, max: 4000 },
  4: { min: 4000, max: 10000 },
  5: { min: 10000, max: 20000 },
  6: { min: 20000, max: 50000 },
};

exports.filterProducts = async (req, res) => {

  try {
    const { brand, color, price, type } = req.query;
    const filter = {};
    let filtersApplied = false;

    if (brand) {
      filter.brand = brand;
      filtersApplied = true;
    }

    if (color) {
      filter.color = color;
      filtersApplied = true;
    }

    if (price) {
      const priceInt = parseInt(price);

      for (const rangeIndex in priceRanges) {
        if (
          priceInt >= priceRanges[rangeIndex].min &&
          priceInt < priceRanges[rangeIndex].max
        ) {
          filter.price = {
            $gte: priceRanges[rangeIndex].min,
            $lt: priceRanges[rangeIndex].max,
          };
          filtersApplied = true;
          break;
        }
      }
    }

    if (type) {
      filter.type = type;
      filtersApplied = true;
    }
    if (!filtersApplied) {
      const allProducts = await Product.find();
      return res.json({ success: true, products: allProducts });
    }
    const filteredProducts = await Product.find(filter);
    res.json({ success: true, products: filteredProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};
