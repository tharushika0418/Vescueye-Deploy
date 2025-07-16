import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#465a6e" />

      {/* Profile Button */}
      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
        accessibilityLabel="Profile"
      >
        <Ionicons name="person-circle-outline" size={36} color="#fff" />
      </Pressable>

      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Vescueye Logo */}
        <Image
          source={require("../assets/vescueye-logo.png")}
          style={styles.logo} // Adjust the path to your logo
        />
        <Text style={styles.header}>Welcome, Doctor</Text>
        <Text style={styles.subHeader}>Manage your activities smartly</Text>
      </View>

      {/* Buttons at the bottom */}
      <View style={styles.bottomSection}>
        <HoverButton
          icon="people"
          label="View Patients"
          onPress={() => navigation.navigate("Dashboard")}
        />
        <HoverButton
          icon="pulse"
          label="View Live Data"
          onPress={() => navigation.navigate("LiveFlapScreen")}
        />
        <HoverButton
          icon="log-out"
          label="Logout"
          onPress={() => navigation.navigate("Welcome")}
        />
      </View>
    </View>
  );
}

// Hoverable Button
const HoverButton = ({ icon, label = "Default Label", onPress }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.button, hovered && styles.buttonHover]}
    >
      <Ionicons name={icon} size={24} color={hovered ? "#fff" : "#000"} />
      <Text style={[styles.buttonText, hovered && styles.buttonTextHover]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#465a6e",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  profileButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#ffffff20",
    borderRadius: 40,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 20, // Reduced top margin to make space for the logo
    marginBottom: 40,
  },
  logo: {
    width: 120, // Adjust the size of the logo as needed
    height: 120, // Adjust the size of the logo as needed
    marginBottom: 20, // Space between logo and header text
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  subHeader: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 6,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 14,
    width: "90%",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#5db5c7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    transitionDuration: "200ms",
  },
  buttonHover: {
    backgroundColor: "#0d8adf",
    transform: [{ scale: 1.02 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 12,
  },
  buttonTextHover: {
    color: "#fff",
  },
});
