const express=require("express");
const { addCategory, getCategories, updateCategories } = require("../controller/category");
const {requireSignin}=require("../middleware/index")
const router=express.Router();

router.post(
  "/category/create",
  requireSignin,
//   superAdminMiddleware,
//   upload.single("categoryImage"),
  addCategory
);
router.get("/allCategories", getCategories);
router.put('/update-categories', updateCategories);


module.exports = router;
