const express = require('express');



const mainpageController = require('../controller/mainpage');


const router = express.Router();


router.get('/', mainpageController.gethomePage);
router.get('', mainpageController.geterrorPage)

module.exports = router;