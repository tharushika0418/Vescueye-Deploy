const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["doctor", "patient", "hospital"] },
  telephone: { type: String, required: true },
  nic: { 
    type: String,
    required: function () {
      return this.role === "doctor" || this.role === "patient"; // Required only for doctors & patients
    },
  },
  address: { type: String, required: function () { return this.role === "hospital"; } },
  registrationNumber: { type: String, required: function () { return this.role === "hospital"; } },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
