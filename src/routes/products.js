const express = require("express");
const { createProduct, getProducts, deleteProduct, getProductsBySlug } = require("../controller/product");
const multer = require("multer");
const router = express.Router();
const shortid = require("shortid");
const path = require("path");
const { requireSignin } = require('../middleware/index');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/product/create",
  requireSignin, 
  upload.array("productPicture"),
  createProduct
);
router.get("/getAllProducts", getProducts);
router.delete("/delete/:productId", deleteProduct)
router.delete("/products/:slug", getProductsBySlug)

module.exports = router;
