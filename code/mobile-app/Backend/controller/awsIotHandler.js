const FlapData = require("../models/FlapData");
const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws");
const { sendAbnormalityNotification } = require("./notificationService");
require("dotenv").config();

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("✅ Mobile app connected to WebSocket");
  ws.send(JSON.stringify({ message: "Connected to real-time updates" }));
});

const device = awsIot.device({
  keyPath: process.env.AWS_IOT_PRIVATE_KEY || "/home/ubuntu/certs/privateKey.pem",
  certPath: process.env.AWS_IOT_CERTIFICATE || "/home/ubuntu/certs/certificate.pem",
  caPath: process.env.AWS_IOT_CA || "/home/ubuntu/certs/caCert.pem",
  clientId: process.env.AWS_IOT_CLIENT_ID || "yourClientId",
  host: process.env.AWS_IOT_ENDPOINT || "yourEndpoint.iot.region.amazonaws.com",
});

device.on("connect", () => {
  console.log("✅ Connected to AWS IoT Core");
  device.subscribe(["sensor/data"], (err) => {
    if (err) {
      console.error("❌ Subscription Error:", err);
    } else {
      console.log("✅ Subscribed to sensor/data");
    }
  });
});

device.on("message", async (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const { patient_id, image_url, temperature, vein_percentage,continuity_score } = data;
    // const abnormal = vein_percentage < 80 || continuity_score < 7;
    const abnormal = continuity_score < 8;
    console.log("Abnormality Check:", abnormal);
    console.log("🔹 Received Data:", data);

    // Save data to MongoDB
    const flapData = new FlapData({
      patient_id,
      image_url,
      temperature
    });
    // await flapData.save();

    // Broadcast to WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ patient_id, image_url, temperature }));
      }
    });

    // Trigger push notification if abnormality detected
    if (temperature <= 30 || abnormal === true) {
      console.log("Abnormality detected, sending push notification...");
      try {
        await sendAbnormalityNotification("yes");
      } catch (notifyError) {
        console.error("Notification error:", notifyError);
      }
    }

    device.publish(
      "sensor/response",
      JSON.stringify({ status: "success", message: "Data received and processed" })
    );
  } catch (error) {
    console.error("❌ Error processing MQTT message:", error);
    device.publish(
      "sensor/response",
      JSON.stringify({ status: "error", message: "Invalid JSON format" })
    );
  }
});

device.on("error", (error) => {
  console.error("❌ AWS IoT Connection Error:", error);
});

module.exports = { device, wss };
