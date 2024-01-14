const express = require("express");

const router = express.Router();

const Controller = require("../controller/user");

router.post("/signup", Controller.signupdetails);
router.post("/login", Controller.logindetails);
router.get("/get-new-token", Controller.updatetoken);
router.get("", Controller.usergethomePage);

module.exports = router;
