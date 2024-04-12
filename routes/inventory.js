// inventory.js router module

const express = require('express');
const router = express.Router();

// Require controller modules
const item_control = require("../controllers/itemControl");
const cat_control = require("../controllers/catControl");

// GET Inventory home page
router.get("/", item_control.index);

// GET Inventory and show all Items
router.get("/all", item_control.show_all)
  
// GET request for Item details
router.get("/item/:id", item_control.item_details)

// GET request for Item CREATE form
router.get("/create/item", item_control.make_new)

// POST to confirm Item creation
router.post("/create/item", item_control.post_make_new)

// GET request for Item UPDATE form
router.get("/item/:id/update", item_control.get_update_form)

// POST to confirm Item update
router.post("/item/:id/update", item_control.post_update_item)

// GET request for Item DELETE form
router.get("/item/:id/delete", item_control.get_delete_form)

// POST to confirm Item deletion
router.post("/item/:id/delete", item_control.post_delete_item)

// GET Categories page
router.get("/cat", cat_control.cat_get);

// GET request for Category details
router.get("/cat/:id", cat_control.cat_details)

// GET request for Category CREATE form
router.get("/create/cat", cat_control.make_new)

// POST to confirm Category creation
router.post("/create/cat", cat_control.post_make_new)

// GET request for Category UPDATE form
router.get("/cat/:id/update", cat_control.get_update_form)

// POST to confirm Category update
router.post("/cat/:id/update", cat_control.post_update_cat)

// GET request for Category DELETE form
router.get("/cat/:id/delete", cat_control.get_delete_form)

// POST to confirm Category deletion
router.post("/cat/:id/delete", cat_control.post_delete_cat)

module.exports = router;
