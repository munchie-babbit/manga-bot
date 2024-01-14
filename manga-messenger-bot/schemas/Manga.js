const mongoose = require("mongoose");
const User = require("../schemas/User");

const MangaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  newestChapter: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  dateLastUpdated: {
    type: Date,
    required: true
  },
  users: {
    type: [User.schema],
    required: true
  }
});

module.exports = mongoose.model("Manga", MangaSchema);
