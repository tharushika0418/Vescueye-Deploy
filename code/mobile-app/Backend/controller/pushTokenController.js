const savedTokens = new Set();

exports.savePushToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Push token is required" });
  }

  if (!savedTokens.has(token)) {
    savedTokens.add(token);
    console.log("✅ Push token saved:", token);
  }

  res.status(200).json({ message: "Push token saved" });
};

exports.getSavedTokens = () => Array.from(savedTokens);
