const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String },
    rating: { type: Number },
    description: { type: String },
    iconLink: { type: String },
    examples: { type: [Object] }
  },
  {
    collection: 'Skills'
  }
);

module.exports.Skill = mongoose.models.skillSchema || mongoose.model('Skill', skillSchema);
