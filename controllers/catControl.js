// Category Controller Moudle - catControl.js

const Category = require('../models/catSchema')
const Item = require('../models/itemSchema');

const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

// Display a list of categories
exports.cat_get = asyncHandler( async function(req, res, next) {
  // Logic to fetch categories from the database or other data source
  console.log('Getting Categories...')

  const categories = await Category.find();
  const totalCats = await Category.countDocuments();

  console.log(categories, totalCats);

  // Render the categories page using a Pug template
  res.render('cat_list', { title: 'Categories', categories, totalCats});
});

// Render details about a single Category
exports.cat_details = asyncHandler(async (req, res, next) => {
  try {
      // Fetch category details from MongoDB based on ID
      const category = await Category.findById(req.params.id);
      
      if (!category) {
          // If item not found, handle the error
          return res.status(404).send('Category not found');
      }

      const items = await Item.find({ category: category._id });

      // Render the 'item_details' template with the item data
      res.render('cat_detail', { title: 'Category Details', category, items });
  } catch (err) {
      // Handle any errors that occur during the process
      return next(err);
  }
});

// GET form to create new category
exports.make_new = asyncHandler(async (req, res, next) => {
  console.log('Getting new category form...')
  res.render('new_cat', { title: 'Create New Category', errors: [] });
});


// POST the new Category
exports.post_make_new = [
  // Validate and sanitize fields.
  body('name').trim().isLength({ min: 1 }).escape().withMessage('Name is required.'),
  body('description').trim().isLength({ min: 1 }).escape().withMessage('Description is required.'),
  
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      // There are validation errors, render the form again with errors
      return res.status(400).render('new_cat', {
        title: 'Create New Category',
        errors: errors.array()
      });
    }

    // All fields are valid, create the new category
    const { name, description } = req.body;

    try {
      // Check if a category with the same name already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).render('new_cat', {
          title: 'Create New Category',
          errors: [{ msg: 'Category name already exists. Please choose a different name.' }]
        });
      }

      // Create new category in MongoDB
      const category = new Category({
        name,
        description
      });

      await category.save()

      console.log('New category: ', category);

      res.redirect(category.url); // Redirect to new category's detail page after successful POST
    } catch (err) {
      // Handle database save error
      return next(err);
    }
  }),
];



// GET Category update form
exports.get_update_form = asyncHandler(async (req, res, next) => {
  try {

      const categoryId = req.params.id;
      
      const category = await Category.findById(categoryId);

      if (!category) {
      // If item not found, handle the error
          return res.status(404).send('Item not found');
      }

      res.render('cat_update', { 
          title: 'Update Category', 
          category
      });

  } catch (err) {
  // Handle any errors that occur during the process
      return next(err);
  }
});

// POST the updated category info
exports.post_update_cat = [

  body('name').trim().isLength({ min: 1 }).escape().withMessage('Name is required.'),
  body('description').trim().isLength({ min: 1 }).escape().withMessage('Description is required.'),
  
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('cat_update', {
        title: 'Update Category',
        category: req.body,
        errors: errors.array()
      });
    }

    const categoryId = req.params.id;

    try {
      // Find the category by ID
      let category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).send('Category not found');
      }

      const existingCategory = await Category.findOne({ name: req.body.name, _id: { $ne: categoryId } });
      if (existingCategory) {
        return res.status(400).render('cat_update', {
          title: 'Update Category',
          category: req.body,
          errors: [{ msg: 'Category name already exists. Please choose a different name.' }]
        });
      }

      category.name = req.body.name;
      category.description = req.body.description;

      await category.save();

      res.redirect(category.url);
    } catch (err) {
      return next(err);
    }
  }),
];

// GET confirmation when deleting category
exports.get_delete_form = asyncHandler(async (req, res, next) => {
  try {
    const catId = req.params.id;
    
    const category = await Category.findById(catId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    // Fetch items associated with the category
    const items = await Item.find({ category: category._id });

    res.render('cat_delete', { 
      title: 'Delete Category', 
      category,
      items  // Pass the items to the template
    });

  } catch (err) {
    // Handle any errors that occur during the process
    return next(err);
  }
});

// POST the removal of category
exports.post_delete_cat = asyncHandler(async (req, res, next) => {
  try {
    const catId = req.params.id;

    // Check if any items are associated with this category
    const items = await Item.find({ category: catId });

    const category = await Category.findById(catId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    if (items.length > 0) {

      const warningMsg = `This category contains ${items.length} item(s). Please remove or re-categorize them before proceeding.`;
      const errors = [{ msg: warningMsg }];

      // Render the confirmation page with associated items
      return res.status(400).render('cat_delete', {
        title: 'Delete Category',
        category: req.body,
        items,
        category,
        errors
      });
    } else {
      // No associated items, proceed with category deletion
      await Category.findByIdAndDelete(catId);
      res.redirect('/inventory/cat'); // Redirect to category view after deletion
    }
  } catch (err) {
    // Handle any errors that occur during the process
    return next(err);
  }
});




