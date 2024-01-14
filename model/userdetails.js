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
  expenses: [{ type: Schema.Types.ObjectId, ref: "expense" }],
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
});

module.exports = mongoose.model("users", usersSchema);
