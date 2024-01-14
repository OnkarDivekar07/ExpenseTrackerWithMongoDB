const uuid = require('uuid');
const formData = require('form-data');
require('dotenv').config();
const Mailgun = require('mailgun.js');
const userdetailstable = require('../model/userdetails');
const bcrypt = require('bcrypt');
const Forgotpassword = require('../model/forgotpassword')


exports.forgotpassword = async (req, res) => {
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    });

    try {
        const { email } = req.body;
        const user = await userdetailstable.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true });

            const link = `http://43.205.116.5/password/resetpassword/${id}`;
            const messageData = {
                from: 'Excited User <divekaronkar787@gmail.com>',
                to: email,
                subject: 'Reset Password',
                text: `Click on the following link to reset your password: ${link}`,
                html: `<a href="${link}">Reset password</a>`,
            };

            await client.messages.create(process.env.MAILGUN_DOMAIN, messageData);

            return res.status(202).json({ message: 'Link to reset password sent to your mail', success: true });
        } else {
            throw new Error("User doesn't exist");
        }
    } catch (err) {
        console.error('General Error:', err);
        return res.json({ message: err.message || 'An error occurred', success: false });
    }
};

exports.resetpassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });

        if (forgotpasswordrequest) {
            await forgotpasswordrequest.update({ active: false });

            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called')
                        }
                    </script>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>reset password</button>
                    </form>
                </html>`
            );

            res.end();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

exports.updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const resetpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });

        if (resetpasswordrequest) {
            const user = await userdetailstable.findOne({ where: { id: resetpasswordrequest.userId } });

            if (user) {
                const saltRounds = 10;
                const hash = await bcrypt.hash(newpassword, saltRounds);

                await user.update({ password: hash });
                return res.status(201).json({ message: 'Successfully update the new password' });
            } else {
                return res.status(404).json({ error: 'No user exists', success: false });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(403).json({ error, success: false });
    }
};


exports.emailPage = (request, response, next) => {
    response.sendFile('email.html', { root: 'view' });
}