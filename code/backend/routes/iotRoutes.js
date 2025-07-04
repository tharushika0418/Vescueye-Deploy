const express = require("express");
const { getLatestData, getFlapData } = require("../controllers/iotController");

const router = express.Router();

router.get("/latest", getLatestData);
router.get("/flapData/:patient_id", getFlapData);

module.exports = router;
