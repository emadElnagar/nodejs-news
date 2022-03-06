const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  title: { type: String, required: true, unique: true },
  slug: { type: String, required:  true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
