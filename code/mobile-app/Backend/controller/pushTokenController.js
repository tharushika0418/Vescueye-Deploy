const Doctor = require("../models/Doctor");

exports.savePushToken = async (req, res) => {
  try {
    const { token, doctorId } = req.body;
    
    if (!token || !doctorId) {
      return res.status(400).json({ 
        success: false,
        message: "Both token and doctorId are required" 
      });
    }

    // Update the doctor's record with the new push token
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { expoPushToken: token },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    console.log(`✅ Push token saved for doctor: ${updatedDoctor.name}`);
    res.status(200).json({
      success: true,
      message: "Push token updated successfully",
      doctor: updatedDoctor
    });
    
  } catch (error) {
    console.error("Error saving push token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};