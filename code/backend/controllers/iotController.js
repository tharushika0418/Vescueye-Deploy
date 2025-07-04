const FlapData = require("../models/FlapData");
const { latestData } = require("../mqttClient");

//Get latest data
const getLatestData = async (req, res) => {
  res.json({ success: true, data: latestData });
};

const getFlapData = async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const flapData = await FlapData.find({ patient_id }).lean(); // Await the query

    if (!flapData.length) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No flap data found for this patient.",
        });
    }

    res.json({ success: true, data: flapData });
  } catch (error) {
    console.error("Error fetching flap data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getLatestData, getFlapData };
