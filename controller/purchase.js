const User = require("../model/userdetails");
const Razorpay = require("razorpay");
const Order = require("../model/order");
require("dotenv").config();

exports.purchasepremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = process.env.amount;

    const createOrder = () => {
      return new Promise((resolve, reject) => {
        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
          if (err) {
            console.log("Error creating order:", err);
            reject(err);
          } else {
            try {
              const newOrder = new Order({
                orderid: order.id,
                status: "PENDING",
                userId: req.userId.userid,
                paymentid: order.id,
              });
              await newOrder.save();
              resolve(order);
            } catch (error) {
              reject(error);
            }
          }
        });
      });
    };

    const order = await createOrder();
    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (error) {
    console.error("Error in purchasepremium:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updatetranctionstatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ orderid: order_id });

    if (order) {
      await order.updateOne({ paymentid: payment_id, status: "successful" });

      const user = await User.findOne({ _id: req.userId.userid });

      if (user) {
        await user.updateOne({ ispremiumuser: true });

        return res
          .status(202)
          .json({ success: true, message: "Transaction successful" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    console.error("Error in updatetranctionstatus:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.leaderboardPage = (request, response, next) => {
  response.sendFile("leaderboard.html", { root: "view" });
};

exports.downloadreport = (request, response, next) => {
  response.sendFile("downloadreport.html", { root: "view" });
};

exports.premiummembership = (request, response, next) => {
  response.sendFile("premiummembership.html", { root: "view" });
};
