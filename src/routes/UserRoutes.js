const express=require("express");
const { createCategory } = require("../controller/category");
const { signup, signin } = require("../controller/auth");
const router=express.Router();

router.post("/register", signup)
router.post("/signin", signin)

module.exports = router;
