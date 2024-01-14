const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  psid: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
