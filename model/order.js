const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  paymentid: {
    type: String,
    required: true,
  },
  orderid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
