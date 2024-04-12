// Item model - itemSchema.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = require('./catSchema')

const inventorySchema = new mongoose.Schema({
  name: String,
  description: String,
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  price: Number,
  stock: Number,
});

// Virtual for item's URL
inventorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/item/${this._id}`;
});

const Item = mongoose.model('Item', inventorySchema);

module.exports = Item;