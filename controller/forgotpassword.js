const uuid = require("uuid");
const formData = require("form-data");
require("dotenv").config();
const Mailgun = require("mailgun.js");
const User = require("../model/userdetails");
const bcrypt = require("bcrypt");
const Forgotpassword = require("../model/forgotpassword");

exports.forgotpassword = async (req, res) => {
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  try {
    const { Email } = req.body;
    const user = await User.findOne({ Email });

    if (user) {
      const UUIDId = uuid.v4();
      await Forgotpassword.create({
        userId: user._id,
        UUIDId: UUIDId,
        active: true,
      });

      const link = `http://localhost:3553/password/resetpassword/${UUIDId}`;
      const messageData = {
        from: "Excited User <divekaronkar787@gmail.com>",
        to: Email,
        subject: "Reset Password",
        text: `Click on the following link to reset your password: ${link}`,
        html: `<a href="${link}">Reset password</a>`,
      };

      await client.messages.create(process.env.MAILGUN_DOMAIN, messageData);

      return res.status(202).json({
        message: "Link to reset password sent to your mail",
        success: true,
      });
    } else {
      throw new Error("User doesn't exist");
    }
  } catch (err) {
    console.error("General Error:", err);
    return res.json({
      message: err.message || "An error occurred",
      success: false,
    });
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const UUIDId = req.params.UUIDId;
    const forgotpasswordrequest = await Forgotpassword.findOne({ UUIDId });

    if (forgotpasswordrequest) {
      await forgotpasswordrequest.updateOne({ active: false });

      res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called')
                        }
                    </script>
                    <form action="/password/updatepassword/${UUIDId}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>reset password</button>
                    </form>
                </html>`);

      res.end();
    } else {
      res
        .status(404)
        .json({ message: "Forgot password request not found", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

exports.updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    const resetpasswordrequest = await Forgotpassword.findOne({
      UUIDId: resetpasswordid,
    });

    if (resetpasswordrequest) {
      const user = await User.findOne({
        _id: resetpasswordrequest.userId,
      });

      if (user) {
        const saltRounds = 10;
        const hash = await bcrypt.hash(newpassword, saltRounds);

        await user.updateOne({ password: hash });

        return res
          .status(201)
          .json({ message: "Successfully updated the new password" });
      } else {
        return res
          .status(404)
          .json({ error: "No user exists", success: false });
      }
    } else {
      return res
        .status(404)
        .json({ error: "Reset password request not found", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, success: false });
  }
};

exports.emailPage = (request, response, next) => {
  response.sendFile("email.html", { root: "view" });
};
