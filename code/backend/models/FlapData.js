const mongoose = require("mongoose");

const FlapDataSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  image_url: { type: String, required: true }, // Image stored in S3
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
},{collection:"flapdatas"});

const FlapData = mongoose.model("FlapData", FlapDataSchema);
module.exports = FlapData;
