const express = require("express");
const router = express.Router();
const { savePushToken } = require("../controller/pushTokenController");

router.post("/savePushToken", savePushToken);

module.exports = router;
