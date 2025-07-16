const FlapData = require("../models/FlapData");
const Patient = require("../models/Patient");  
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

    // 1. Find the patient and their assigned doctor
     const patient = await Patient.findById(patient_id)
      .populate('assignedDoctor', 'name email expoPushToken') // Only get needed fields
      .exec();

    if (!patient) {
      console.log(`Patient ${patient_id} not found`);
      return;
    }
    // let PushToken;
    // 2. Log the assigned doctor info
    if (patient.assignedDoctor) {
      console.log('Assigned Doctor:', {
        name: patient.assignedDoctor.name,
        email: patient.assignedDoctor.email,
        hasPushToken: !!patient.assignedDoctor.expoPushToken,
        PushToken : patient.assignedDoctor.expoPushToken
      });
    } else {
      console.log('No doctor assigned to this patient');
    }

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
      console.log(`Patient ID: ${patient_id} Abnormality detected, sending push notification...`);
      try {
        await sendAbnormalityNotification("yes",[patient.assignedDoctor.expoPushToken]);
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


// const FlapData = require("../models/FlapData");
// const Patient = require("../models/Patient");  
// const awsIot = require("aws-iot-device-sdk");
// const WebSocket = require("ws");
// const { sendAbnormalityNotification } = require("./notificationService");
// require("dotenv").config();

// const wss = new WebSocket.Server({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("✅ Mobile app connected to WebSocket");
//   ws.send(JSON.stringify({ message: "Connected to real-time updates" }));
// });

// const device = awsIot.device({
//   keyPath: process.env.AWS_IOT_PRIVATE_KEY || "/home/ubuntu/certs/privateKey.pem",
//   certPath: process.env.AWS_IOT_CERTIFICATE || "/home/ubuntu/certs/certificate.pem",
//   caPath: process.env.AWS_IOT_CA || "/home/ubuntu/certs/caCert.pem",
//   clientId: process.env.AWS_IOT_CLIENT_ID || "yourClientId",
//   host: process.env.AWS_IOT_ENDPOINT || "yourEndpoint.iot.region.amazonaws.com",
// });

// device.on("connect", () => {
//   console.log("✅ Connected to AWS IoT Core");
//   device.subscribe(["sensor/data"], (err) => {
//     if (err) {
//       console.error("❌ Subscription Error:", err);
//     } else {
//       console.log("✅ Subscribed to sensor/data");
//     }
//   });
// });

// device.on("message", async (topic, payload) => {
//   try {
//     const data = JSON.parse(payload.toString());
//     const { patient_id, image_url, temperature, vein_percentage,continuity_score } = data;
//     // const abnormal = vein_percentage < 80 || continuity_score < 7;
//     const abnormal = continuity_score < 8;
//     console.log("Abnormality Check:", abnormal);
//     console.log("🔹 Received Data:", data);

//     // 1. Find the patient and their assigned doctor
//      const patient = await Patient.findById(patient_id)
//       .populate('assignedDoctor', 'name email expoPushToken') // Only get needed fields
//       .exec();

//     if (!patient) {
//       console.log(`Patient ${patient_id} not found`);
//       return;
//     }
//     let pushTokens = [];

//     // 2. Log the assigned doctor info
//     if (patient.assignedDoctor) {
//   console.log('Assigned Doctor:', {
//     name: patient.assignedDoctor.name,
//     email: patient.assignedDoctor.email,
//     hasPushToken: !!patient.assignedDoctor.expoPushToken,
//     pushToken: patient.assignedDoctor.expoPushToken
//   });

//   // For single doctor (current schema)
//   const pushTokens = patient.assignedDoctor.expoPushToken 
//     ? [patient.assignedDoctor.expoPushToken] 
//     : [];
  
//   console.log('Push Tokens:', pushTokens);
// } else {
//   console.log('No doctor assigned to this patient');
// }

//     // Save data to MongoDB
//     const flapData = new FlapData({
//       patient_id,
//       image_url,
//       temperature
//     });
//     // await flapData.save();

//     // Broadcast to WebSocket clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify({ patient_id, image_url, temperature }));
//       }
//     });

//     // Trigger push notification if abnormality detected
//     if (temperature <= 30 || abnormal === true) {
//       console.log(`Patient ID: ${patient_id} Abnormality detected, sending push notification...`);
//       try {
//         await sendAbnormalityNotification("yes",pushTokens);
//       } catch (notifyError) {
//         console.error("Notification error:", notifyError);
//       }
//     }
//     // Get push tokens (handle both single doctor and multiple doctors cases)
      
//     device.publish(
//       "sensor/response",
//       JSON.stringify({ status: "success", message: "Data received and processed" })
//     );
//   } catch (error) {
//     console.error("❌ Error processing MQTT message:", error);
//     device.publish(
//       "sensor/response",
//       JSON.stringify({ status: "error", message: "Invalid JSON format" })
//     );
//   }
// });

// device.on("error", (error) => {
//   console.error("❌ AWS IoT Connection Error:", error);
// });

// module.exports = { device, wss };
