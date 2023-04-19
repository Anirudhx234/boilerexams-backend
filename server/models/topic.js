const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const topic = new Schema({
  course: {
    type: [Schema.Types.ObjectId],
  },
  name: {
    type: String
  },
  questions: {
    type: [Schema.Types.ObjectId]
  }
});

module.exports = model("topic", topic);