var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  title: { type: String, index: true, required: true },
  description: String,
  tags: { type: [String], index: true },
  fields: { type: [String], required: true },
  date: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Stream', schema);
