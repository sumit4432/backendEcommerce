const Product = require("../modals/product");
const mongoose = require('mongoose');
const shortid = require("shortid");
const slugify = require("slugify");
const Category = require("../modals/category");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, quantity } = req.body;
    let productPictures = [];
    if (req.files && req.files.length > 0) {
      productPictures = req.files.map((file) => {
        return { img: file.filename };
      });
    }

    // Check if req.user and req.user._id are defined
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const product = new Product({
      name: name,
      slug: slugify(name),
      price,
      quantity,
      description,
      productPictures,
      category,
      createdBy: req.user._id,
    });

    const savedProduct = await product.save();

    res.status(201).json({ product: savedProduct, files: req.files });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getProductsBySlug = (req, res) => {
  const { slug } = req.params;
  Category.findOne({ slug: slug })
    .select("_id type")
    .exec((error, category) => {
      if (error) {
        return res.status(400).json({ error });
      }

      if (category) {
        Product.find({ category: category._id }).exec((error, products) => {
          if (error) {
            return res.status(400).json({ error });
          }

          if (category.type) {
            if (products.length > 0) {
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
            }
          } else {
            res.status(200).json({ products });
          }
        });
      }
    });
};

exports.getProductDetailsById = (req, res) => {
  const { productId } = req.params;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(200).json({ product });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
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
