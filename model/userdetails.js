const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ispremiumuser: Boolean,
  totalExpenses: Number,
});

module.exports = mongoose.model("users", usersSchema);
