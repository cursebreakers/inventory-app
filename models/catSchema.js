// Category model - catSchema.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
  name: [{ type: String, required: true }],
  description: String,
});

// Virtual for item's URL
categorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/cat/${this._id}`;
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;