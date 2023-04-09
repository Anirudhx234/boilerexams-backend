const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const problem = new Schema({
  course: {
    type: String,
  },
  topic: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  exam: {
    type: Number,
    required: true,
  },
  question: {
    type: Number,
    required: true
  },
  image_url: {
    type: String,
    required: true,
  },
});

module.exports = model("problem", problem);