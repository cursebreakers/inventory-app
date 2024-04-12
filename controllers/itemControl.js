// Inventory Controller - itemControl.js

const Item = require('../models/itemSchema')
const Category = require('../models/catSchema')
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Function to calculate the total value of items
const valuator = (items) => {
    let totalValue = 0;
    let totalUnits = 0;

    items.forEach(item => {
        totalValue += item.stock * item.price;
        totalUnits += item.stock;
    });
    console.log('Total Value:', totalValue);
    console.log('Total Units:', totalUnits);

    return { totalValue, totalUnits };
};

// Renders the main index page
exports.index = asyncHandler(async (req, res, next) => {
    try {
        console.log('Trying index router...');
        const totalItems = await Item.countDocuments();
        const totalCats = await Category.countDocuments();

        // Fetch all items from MongoDB
        const items = await Item.find();

        // Calculate total value of items
        const { totalValue, totalUnits } = valuator(items);

        res.render('index', { 
            title: 'Inventory Manager',
            overview: 'Overview',
            toolkit: 'Toolkit',
            totalItems,
            totalCats,
            totalValue,
            totalUnits
        });
    } catch (err) {
        // Handle any errors that occur during the process
        return next(err);
    }
});

// List all items
exports.show_all = asyncHandler(async function(req, res, next) {
    try {
        console.log('Showing all items...');

        // Fetch item details from MongoDB
        const items = await Item.find().populate('category');
        const totalItems = await Item.countDocuments();

        // Calculate total value of items
        const { totalValue, totalUnits } = valuator(items);

        items.forEach(item => {
            item.totalValue = item.stock * item.price;
        });

        console.log('All items: ', items)

        // Render the 'list_all' template with the items data, totalItems, and totalValue
        res.render('list_all', { 
            title: 'All Items',
            items, 
            totalItems,
            totalUnits,
            totalValue
        });
    } catch (err) {
        // Handle any errors that occur during the process
        return next(err);
    }
});

// List a specific item's details
exports.item_details = asyncHandler(async (req, res, next) => {
    try {
        // Fetch item details from MongoDB based on ID
        const item = await Item.findById(req.params.id).populate('category');
    
        if (!item) {
            // If item not found, handle the error
            return res.status(404).send('Item not found');
        }

        // Calculate total value of item
        const totalValue = valuator([item]);
        const itemTotalValue = totalValue.totalValue;

        // Render the 'item_details' template with the item data and totalValue
        res.render('item_detail', { 
            title: 'Item Details', 
            totalValue: itemTotalValue,
            item,
            item_id: item._id
        });

    } catch (err) {
        // Handle any errors that occur during the process
        return next(err);
    }
});

// GET the Create New Item form
exports.make_new = asyncHandler(async (req, res, next) => {
    try {

      const categories = await Category.find({}, 'name');

      res.render('new_item', { 
          title: 'Create New Item',
          categories
      });

    } catch (err) {
        // Handle error if fetching categories fails
        return next(err);
    }
});

// POST new item after creation
exports.post_make_new = [
    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name is required.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description is required.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category is required.'),
    body('price').isNumeric().withMessage('Price must be a number and cannot be empty.').toInt().isInt({ min: 1 }).withMessage('Price must be at least 1.'),
    body('stock').isInt({ min: 1, max: 999 }).withMessage('Stock must be a positive integer between 1 and 999.').toInt(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      console.log('Posting new item...');

      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        // There are validation errors, render the form again with errors
        const categories = await Category.find({}, 'name');
        return res.status(400).render('new_item', {
            title: 'Create New Item',
            categories,
            errors: errors.array()
        });
      }

      const { name, description, category, price, stock } = req.body;

      let item; // Declare item variable

      try {
        // Check if the item name already exists
          const existingItem = await Item.findOne({ name });
          if (existingItem) {
              return res.status(400).render('new_item', {
                  title: 'Create New Item',
                  categories: await Category.find({}, 'name'),
                  errors: [{ msg: 'Item name already exists. Please choose a different name.' }]
              });
          }

          // Create new item in MongoDB
          item = new Item({
              name,
              description,
              category,
              price,
              stock
          });

          await item.save();

          console.log('New item: ', item);

          res.redirect(item.url); // Redirect to new item's detail page after successful POST
      } catch (err) {
        // Handle database save error
          return next(err);
      }
    }),
];

// GET update form
exports.get_update_form = asyncHandler(async (req, res, next) => {
    try {

        const itemId = req.params.id;
        
        const item = await Item.findById(itemId);

        if (!item) {
        // If item not found, handle the error
            return res.status(404).send('Item not found');
        }

        const categories = await Category.find();

        res.render('item_update', { 
            title: 'Update Item', 
            item,
            categories
        });

    } catch (err) {
    // Handle any errors that occur during the process
        return next(err);
    }
});


// POST item update
exports.post_update_item = [
    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name is required.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description is required.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category is required.'),
    body('price').isNumeric().withMessage('Price must be a number and cannot be empty.').toInt().isInt({ min: 1 }).withMessage('Price must be at least 1.'),
    body('stock').isInt({ min: 1, max: 999 }).withMessage('Stock must be a positive integer between 1 and 999.').toInt(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are validation errors, render the form again with errors
            const item = await Item.findById(req.params.id);
            const categories = await Category.find();
            return res.status(400).render('item_update', {
                title: 'Update Item',
                item,
                categories,
                errors: errors.array()
            });
        }

        const { name, description, category, price, stock } = req.body;

        let item; // Declare item variable

        try {
            // Check if the item name already exists (optional)
            const existingItem = await Item.findOne({ name });
            if (existingItem && existingItem._id.toString() !== req.params.id) {
                // Item name already exists for another item
                const item = await Item.findById(req.params.id);
                const categories = await Category.find();
                return res.status(400).render('item_update', {
                    title: 'Update Item',
                    item,
                    categories,
                    errors: [{ msg: 'Item name already exists. Please choose a different name.' }]
                });
            }

            // Update the item in MongoDB
            await Item.findByIdAndUpdate(req.params.id, {
                name,
                description,
                category,
                price,
                stock
            });

            console.log('Item updated successfully.');

            // Redirect to item detail page or other appropriate route
            res.redirect(`/inventory/item/${req.params.id}`); // Example redirection
        } catch (err) {
            // Handle database update error
            return next(err);
        }
    })
];

// GET confirmation when deleting specific item
exports.get_delete_form = asyncHandler(async (req, res, next) => {
    try {

        const itemId = req.params.id;
        
        const item = await Item.findById(itemId);

        if (!item) {
        // If item not found, handle the error
            return res.status(404).send('Item not found');
        }

        res.render('item_delete', { title: 'Delete Item', item });

    } catch (err) {
    // Handle any errors that occur during the process
        return next(err);
    }
});

// POST deletion of item and redirect user to index
exports.post_delete_item = asyncHandler(async (req, res, next) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).send('Item not found');
        }
        
        await Item.findByIdAndDelete(itemId);
        
        res.redirect('/inventory');
    } catch (err) {
        return next(err);
    }
});