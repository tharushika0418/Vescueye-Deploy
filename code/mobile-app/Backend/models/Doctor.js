const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 0 },
    specialty: { type: String, required: true },
    contact: { type: String, required: true },
    expoPushToken: { type: String, default: null }, // Add this field
    assignedPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);