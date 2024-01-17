const User = require("../model/userdetails");
const expense = require("../model/expensemodel");
const AWS = require("aws-sdk");

async function uploadToS3(stringfyexpense, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const SECRET_KEY = process.env.SECRET_KEY;

  const s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: SECRET_KEY,
    Bucket: BUCKET_NAME,
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: stringfyexpense,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("something went wrong");
        reject(err);
      } else {
        resolve(s3response.Location);
      }
    });
  });
}

exports.getexpense = async (req, res) => {
  try {
    const result = await expense.find({ userId: req.userId.userid });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.postexpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.userId.userid;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const newExpense = new expense({
      amount,
      description,
      category,
      userId,
    });

    await newExpense.save();

    user.totalExpenses = (user.totalExpenses || 0) + amount;
    await user.save();

    res.json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.deleteexpense = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteexpense = await expense.findById(id);
    if (!deleteexpense) {
      return res.status(404).send("Expense not found");
    }

    await expense.findByIdAndDelete(id);
    res.send("Successfully deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.leaderboard = async (req, res) => {
  try {
    const leaderboardData = await User.find({})
      .select("_id Name totalExpenses")
      .sort({ totalExpenses: -1 });
    res.json(leaderboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    const dexpenses = await expense.find({ userId: req.userId.userid });
    if (!dexpenses || dexpenses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expenses not found" });
    }

    const stringifiedExpenses = JSON.stringify(dexpenses);
    const userId = req.userId.userid;
    const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
    const fileUrl = await uploadToS3(stringifiedExpenses, filename);
    res.status(201).json({ fileUrl, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};
