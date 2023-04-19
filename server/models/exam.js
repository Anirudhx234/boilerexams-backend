const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const exam = new Schema({
  course: {
    type: Schema.Types.ObjectId,
  },
  examNumber: {
    type: Number
  },
  semester: {
    type: Schema.Types.ObjectId
  },
  questions: {
    type: [Schema.Types.ObjectId]
  }
});

exam.index({course: 1, examNumber: 1, semester: 1}, {unique: true});
module.exports = model("exam", exam);