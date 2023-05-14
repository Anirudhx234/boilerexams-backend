const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const topic = new Schema({
  course: {
    type: [Schema.Types.ObjectId],
    ref: 'course'
  },
  name: {
    type: String,
    unique: true
  },
  questions: {
    type: [Schema.Types.ObjectId],
    ref: 'question'
  }
});

module.exports = model("topic", topic);