const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const exam = new Schema({
  // Reference to the course an exam is part of. For example, the course could be Calculus 3.
  course: {
    type: Schema.Types.ObjectId,
    ref: 'course'
  },
  // This is the exam number for a particular semester in the course (for example, Exam 1 in Fall 2020). 
  // Does not correspond to any index.
  number: {
    type: Number
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'semester'
  },
  questions: {
    type: [Schema.Types.ObjectId],
    ref: 'question'
  }
});

exam.index({course: 1, number: 1, semester: 1}, {unique: true});
module.exports = model("exam", exam);