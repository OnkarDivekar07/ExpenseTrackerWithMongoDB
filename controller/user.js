const User = require("../model/userdetails");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function genrateAcesstoken(id, ispremiumuser) {
  return jwt.sign(
    { userid: id, ispremiumuser: ispremiumuser },
    process.env.secretKey
  );
}

exports.usergethomePage = (request, response, next) => {
  response.sendFile("expense.html", { root: "view" });
};

exports.logindetails = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ Email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = genrateAcesstoken(user._id, user.ispremiumuser);

        return res.json({
          success: true,
          message: "Login successful",
          token: token,
        });
      } else {
        return res.json({ success: false, message: "Incorrect password" });
      }
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred" });
  }
};

exports.signupdetails = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await User.findOne({ Email: email });

    if (!existingUser) {
      const newUser = new User({
        Name: name,
        Email: email,
        password: hashedPassword,
      });

      await newUser.save();

      return res.json({
        success: true,
        message: "Account created successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "This account already exists",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

exports.updatetoken = async (req, res) => {
  const token = req.header("Authorization");

  try {
    const decodedToken = jwt.verify(token, process.env.secretKey);

    const user = await User.findOne({
      _id: decodedToken.userid,
    });

    if (user) {
      const newToken = genrateAcesstoken(user._id, user.ispremiumuser);

      return res.json({
        success: true,
        message: "Token updated",
        token: newToken,
      });
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(500)
      .json({ success: false, message: "An error occurred" });
  }
};
