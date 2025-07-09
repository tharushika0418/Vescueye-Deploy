const awsIot = require("aws-iot-device-sdk");
const FlapData = require("./models/FlapData");
require("dotenv").config();

// Define the fallback paths for server

const fallbackKeyPath = "/home/ubuntu/certs/privateKey.pem";
const fallbackCertPath = "/home/ubuntu/certs/certificate.pem";
const fallbackCaPath = "/home/ubuntu/certs/caCert.pem";
const fallbackClientId = "yourClientId"; // Replace with your client ID for the server
const fallbackHost = "yourEndpoint.iot.region.amazonaws.com"; // Replace with your endpoint

// Get the key paths from environment variables, fallback to server paths if not set
const keyPath = process.env.AWS_IOT_PRIVATE_KEY || fallbackKeyPath;
const certPath = process.env.AWS_IOT_CERTIFICATE || fallbackCertPath;
const caPath = process.env.AWS_IOT_CA || fallbackCaPath;
const clientId = process.env.AWS_IOT_CLIENT_ID || fallbackClientId;
const host = process.env.AWS_IOT_ENDPOINT || fallbackHost;

// Set up the IoT device with the appropriate paths and configuration
const device = awsIot.device({
  keyPath: keyPath,
  certPath: certPath,
  caPath: caPath,
  clientId: clientId,

  host: host,
});

let latestData = {
  patient_id: null,
  temperature: null,
  image: null,
}; // Store latest received data

device.on("connect", () => {
  console.log("Connected to AWS IoT Core");

  const topics = ["sensor/data", "sensor/image"];
  device.subscribe(topics, (err) => {
    if (err) {
      console.error("Subscription Error:", err);
    } else {
      console.log(`Subscribed to topics: ${topics.join(", ")}`);
    }
  });
});

device.on("message", async (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const { patient_id, image_url, temperature } = data;

    if (topic === "sensor/data") {
      try {
        const flapData = new FlapData({ patient_id, image_url, temperature });
        await flapData.save();

        // Send success response back to Raspberry Pi
        device.publish(
          "sensor/response",
          JSON.stringify({
            status: "success",
            message: "Data stored successfully",
          })
        );
      } catch (dbError) {
        console.error("Database Error:", dbError);

        // Notify Raspberry Pi of failure
        device.publish(
          "sensor/response",
          JSON.stringify({
            status: "error",
            message: "Failed to store data",
          })
        );
      }
    }

    console.log(`Received data on ${topic}:`, data);
  } catch (error) {
    console.error("Error parsing MQTT message:", error);

    // Notify Raspberry Pi of parsing error
    device.publish(
      "sensor/response",
      JSON.stringify({
        status: "error",
        message: "Invalid JSON format",
      })
    );
  }
});

device.on("error", (error) => {
  console.error("AWS IoT Error:", error);
});

module.exports = { device, latestData };
