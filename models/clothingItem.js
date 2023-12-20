const mongoose = require("mongoose");
const validator = require("validator");
const user = require("./user");

const clothingItem = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [30, "Name cannot be more than 30 characters"],
    minlength: [2, "Name cannot be less than 2 characters"],
  },
  weather: {
    type: String,
    required: true,
    enum: ["hot", "warm", "cold"],
  },
  imageUrl: {
    type: String,
    validate: {
      validator: (v) => validator.isURL(v),
      message: "Link is not valid",
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: user,
    },
  ],
});

module.exports = mongoose.model("clothingItems", clothingItem);