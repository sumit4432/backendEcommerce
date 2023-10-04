const slugify = require('slugify');
const shortid = require("shortid");
const Category = require("../modals/category");

// Function to create hierarchical category list
function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  
  if (parentId === null) {
    category = categories.filter((cat) => !cat.parentId);
  } else {
    category = categories.filter((cat) => cat.parentId === parentId);
  }

  for (const cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      type: cate.type,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.addCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    // Validate input data
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const parentCategory = parentId ? await Category.findById(parentId) : null;

    if (parentId && !parentCategory) {
      return res.status(400).json({ error: "Parent category not found" });
    }

    const slug = `${slugify(name)}-${shortid.generate()}`;

    const category = new Category({
      name,
      slug,
      type: req.body.type || "default", // Set a default type if not provided
      parentId: parentCategory ? parentCategory._id : null,
    });

    // Save the category to the database
    const savedCategory = await category.save();

    // Return the newly created category in the response
    res.status(201).json({ category: savedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    // Retrieve all categories from the database
    const categories = await Category.find({});
    
    // Create a function to recursively populate children
    const populateChildren = (category) => {
      const children = categories.filter((cat) => cat.parentId && cat.parentId.toString() === category._id.toString());
      if (children.length > 0) {
        category.children = children.map(populateChildren);
      }
      return category;
    };

    // Find and organize the root categories (categories without parents)
    const rootCategories = categories.filter((cat) => !cat.parentId);
    
    // Organize the categories hierarchically, starting with root categories
    const categoryList = rootCategories.map(populateChildren);

    // Return the list of categories in the response
    res.status(200).json({ categoryList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};




exports.updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    // Validate input data
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Update multiple categories
    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        const { _id, name, type, parentId } = category;

        // Find and update each category
        const updatedCategory = await Category.findOneAndUpdate(
          { _id },
          { name, type, parentId },
          { new: true }
        );

        return updatedCategory;
      })
    );
    res.status(201).json({ updatedCategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteCategories = async (req, res) => {
  try {
    const { ids } = req.body.payload;

    // Validate input data
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Delete multiple categories
    const deletedCategories = await Promise.all(
      ids.map(async (id) => {
        const deleteCategory = await Category.findOneAndDelete({
          _id: id,
          createdBy: req.user._id,
        });

        return deleteCategory;
      })
    );

    // Check if all specified categories were deleted
    if (deletedCategories.length === ids.length) {
      return res.status(201).json({ message: "Categories removed" });
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
