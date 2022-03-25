const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  user: { type: Object, ref: "User", required: true },
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
  content: { type: String, required: true }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', commentSchema);
