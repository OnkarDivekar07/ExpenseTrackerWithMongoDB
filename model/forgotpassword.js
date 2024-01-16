const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  UUIDId: {
    type: String,
    required: true,
    unique: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  expiresBy: {
    type: Date,
  },
});

const Forgotpassword = mongoose.model("Forgotpassword", forgotPasswordSchema);

module.exports = Forgotpassword;
