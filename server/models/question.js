const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const question = new Schema({
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'exam'
  },
  topics: {
    type: [Schema.Types.ObjectId],
    ref: 'topic'
  },
  number: {
    type: Number
  },
  //TODO: Add collections to generalize body into 1 or more categories including Latex, code, images, etc.
  body: {
    type: String
  },
  // Answer choices are the content of each answer, rather than just letters enumerating the answers.
  answerChoices: {
    type: [String]
  },
  // Index of correct answer
  correctAnswer: {
    type: Number
  },
  correctlyAttempted: {
    type: Number
  },
  attempted: {
    type: Number
  },
  notAttempted: {
    type: Number
  },
  //TODO: Generalize for multiple different solutions, different types, etc.
  solution: {
    type: String
  },
  submissions: {
    type: [Schema.Types.ObjectId],
  }
});

module.exports = model("question", question);