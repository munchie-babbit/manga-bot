const mongoose = require("mongoose");

const MangaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  newestChapter: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  dateLastUpdated: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Manga", MangaSchema);
