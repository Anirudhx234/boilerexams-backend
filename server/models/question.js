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
  questionNumber: {
    type: Number
  },
  questionBody: {
    type: String
  },
  answerChoices: {
    type: [String]
  },
  correctAnswer: {
    type: String
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
  solution: {
    type: String
  },
  submissions: {
    type: [Schema.Types.ObjectId],
  }
});

module.exports = model("question", question);