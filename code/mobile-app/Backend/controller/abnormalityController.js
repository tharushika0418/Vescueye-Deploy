const { sendAbnormalityNotification } = require("./notificationService");

exports.sendAbnormality = async (req, res) => {
  const { abnormality } = req.body;

  if (!abnormality || (abnormality !== "yes" && abnormality !== "no")) {
    return res.status(400).json({ message: "Invalid input. Use 'yes' or 'no'." });
  }

  try {
    const result = await sendAbnormalityNotification(abnormality);
    return res.status(200).json({ message: "Notifications sent.", result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send notifications", error: error.message });
  }
};
