const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, index: true },
    body: { type: String },
    published: { type: Boolean },
    tags: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }
  },
  {
    collection: 'post',
    timestamps: true
  }
);

module.exports.Post = mongoose.models.Post || mongoose.model('post', postSchema);
