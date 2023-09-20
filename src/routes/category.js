const express=require("express");
const { addCategory, getCategories } = require("../controller/category");
const router=express.Router();

router.post(
  "/category/create",
//   requireSignin,
//   superAdminMiddleware,
//   upload.single("categoryImage"),
  addCategory
);
router.get("/allCategories", getCategories)

module.exports = router;
