const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const semester = new Schema({
  season: {
    type: String
  },
  year: {
    type: String
  }
});

module.exports = model("semester", semester);