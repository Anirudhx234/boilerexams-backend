const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const semester = new Schema({
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter'],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

module.exports = model("semester", semester);