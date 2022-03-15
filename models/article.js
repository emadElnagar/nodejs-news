const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  title: { type: String, unique: true, required: true },
  subject: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: mongoose.Schema.Types.String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slug: { type: String, required:  true }
}, {
  timestamps: true,
})

module.exports = mongoose.model('Article', articleSchema);
