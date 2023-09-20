const express=require("express");
const { createProduct } = require("../controller/product");

const router=express.Router();

router.post(
  "/product/create",
//   requireSignin,
//   adminMiddleware,
//   uploadS3.array("productPicture"),
  createProduct
);
// router.get("/allCategories", getCategories)

module.exports = router;
