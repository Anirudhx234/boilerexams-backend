const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const course = new Schema({
  code: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    unique: true
  },
  topics: {
    type: [Schema.Types.ObjectId],
    ref: 'topic'
  },
  exams: {
    type: [Schema.Types.ObjectId],
    ref: 'exam'
  },
  semesters: {
    type: [Schema.Types.ObjectId],
    ref: 'semester'
  }
});

module.exports = model("course", course);