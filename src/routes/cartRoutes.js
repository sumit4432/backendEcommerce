const express=require("express");

const { addToCart, deleteQuantityCart } = require("../controller/cart");
const { requireSignin, userMiddleware } = require("../middleware");
const router=express.Router();

router.post("/add-to-cart", requireSignin, userMiddleware, addToCart);
router.post("/delete/:cartId", deleteQuantityCart);


module.exports = router;
