const express = require("express");
const router = express.Router();
const abnormalityController = require("../controller/abnormalityController");

router.post("/", abnormalityController.sendAbnormality);

module.exports = router;
