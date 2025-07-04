const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    medicalHistory: { type: String, default: "No medical history provided" },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Reference to Doctor
      default: null, // A patient may not be assigned to a doctor initially
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
