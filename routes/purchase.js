const express = require('express')

const router = express.Router();

const Controller = require('../controller/purchase')

const userauthenticate = require('../middleware/auth')


router.get('/purchasepremium', userauthenticate.verifyToken, Controller.purchasepremium)
router.post('/updatetranctionstatus', userauthenticate.verifyToken, Controller.updatetranctionstatus);
router.get('/leaderboard', Controller.leaderboardPage);
router.get('/downloadreport', Controller.downloadreport);
router.get('/premiummembership', Controller.premiummembership);



module.exports = router;