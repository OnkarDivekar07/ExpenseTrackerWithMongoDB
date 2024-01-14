const userdetailstable = require('../model/userdetails');
const expense = require('../model/expensemodel');
const AWS = require('aws-sdk');

async function uploadToS3(stringfyexpense, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const SECRET_KEY = process.env.SECRET_KEY;

    const s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: SECRET_KEY,
        Bucket: BUCKET_NAME
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: stringfyexpense,
        ACL: 'public-read'
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
        const result = await expense.findAll({ where: { userId: req.userId.userid } });
        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

exports.postexpense = async (req, res) => {
    try {
        const amount = parseInt(req.body.amount, 10);
        const description = req.body.description;
        const catogary = req.body.catogary;
        const userid = req.userId.userid
        const user = await userdetailstable.findByPk(userid)
        const newExpense = await user.createExpense({
            amount,
            description,
            catogary,
        });

        if (user) {
            user.totalExpenses = user.totalExpenses === null ? amount : user.totalExpenses + amount;
            await user.save();
        }

        res.json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

exports.deleteexpense = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await expense.findByPk(id);

        if (!data) {
            return res.status(404).send('Expense not found');
        }

        await data.destroy();
        res.send('Successfully deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.leaderboard = async (req, res) => {
    try {
        const leaderboardData = await userdetailstable.findAll({
            attributes: ['id', 'Name', 'totalExpenses'],
            order: [['totalExpenses', 'DESC']],
        });

        res.json(leaderboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

exports.downloadExpenses = async (req, res) => {
    try {
        const data = await expense.findAll({ where: { userId: req.userId.userid } });
        const stringfyexpense = JSON.stringify(data);
        const userId = req.userId.userid;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileurl = await uploadToS3(stringfyexpense, filename);
        res.status(201).json({ fileurl, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};
