import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from "react-native";

const WEBSOCKET_URL = "ws://172.20.10.6:8080"; // Replace with your backend IP

const LiveFlapScreen = () => {
  const [flapData, setFlapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket");
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const newFlap = JSON.parse(event.data);
        console.log("🔹 New Flap Data:", newFlap);

        // Keep only the latest 5 images
        setFlapData((prevData) => [newFlap, ...prevData].slice(0, 5));
      } catch (error) {
        console.error("❌ Error parsing WebSocket data:", error);
      }
    };

    ws.onerror = (error) => console.error("❌ WebSocket Error:", error);
    ws.onclose = () => console.log("❌ WebSocket Disconnected");

    return () => ws.close(); // Cleanup WebSocket on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Flap Data</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10e0f8" />
      ) : (
        <FlatList
          data={flapData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.cardText}>
                <Text style={styles.boldText}>Patient ID:</Text> {item.patient_id ?? "N/A"}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.boldText}>Temperature:</Text> {item.temperature?.toFixed(2) ?? "N/A"} °C
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#465a6e",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#10e0f8",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default LiveFlapScreen;
