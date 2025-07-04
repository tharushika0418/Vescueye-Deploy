const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws"); // WebSocket server for mobile app
require("dotenv").config();

// WebSocket Server Setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("✅ Mobile app connected to WebSocket");
  ws.send(JSON.stringify({ message: "Connected to real-time updates" }));
});

// AWS IoT Configuration
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

device.on("message", (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const { patient_id, image_url, temperature } = data;

    console.log("🔹 Received Data:", data); // Display received data in console

    // Notify WebSocket clients (mobile app)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ patient_id, image_url, temperature }));
      }
    });

    // Send response back to AWS IoT device
    device.publish(
      "sensor/response",
      JSON.stringify({ status: "success", message: "Data received and displayed" })
    );
  } catch (error) {
    console.error("❌ Error processing MQTT message:", error);
  }
});

device.on("error", (error) => {
  console.error("❌ AWS IoT Connection Error:", error);
});

module.exports = { device, wss };
