import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const [doctorName, setDoctorName] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get the full name first, fallback to email-based name
        const fullName = await AsyncStorage.getItem("doctorFullName");
        const emailName = await AsyncStorage.getItem("doctorName");
        
        if (fullName) {
          setDoctorName(fullName);
        } else if (emailName) {
          setDoctorName(emailName);
        }

        // Smart greeting based on time and day
        const now = new Date();
        const currentHour = now.getHours();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        let timeGreeting = "";
        let contextualMessage = "";

        // Time-based greeting
        if (currentHour >= 5 && currentHour < 12) {
          timeGreeting = "Good morning";
        } else if (currentHour >= 12 && currentHour < 17) {
          timeGreeting = "Good afternoon";
        } else if (currentHour >= 17 && currentHour < 21) {
          timeGreeting = "Good evening";
        } else {
          timeGreeting = "Good night";
        }

        // Contextual messages based on time and day
        if (isWeekend) {
          if (currentHour >= 6 && currentHour < 12) {
            contextualMessage = "Hope you're having a restful weekend";
          } else {
            contextualMessage = "Thanks for your dedication";
          }
        } else {
          if (currentHour >= 6 && currentHour < 9) {
            contextualMessage = "Ready to start another great day";
          } else if (currentHour >= 9 && currentHour < 12) {
            contextualMessage = "Hope your morning is going well";
          } else if (currentHour >= 12 && currentHour < 17) {
            contextualMessage = "Hope you're having a productive day";
          } else if (currentHour >= 17 && currentHour < 21) {
            contextualMessage = "Winding down for the day";
          } else {
            contextualMessage = "Thanks for your late-night dedication";
          }
        }

        setGreeting({ timeGreeting, contextualMessage });
      } catch (error) {
        console.error("Failed to load doctor info:", error);
        setGreeting({ 
          timeGreeting: "Hello", 
          contextualMessage: "Welcome back" 
        });
      }
    };

    loadUserData();
  }, []);

  // Helper function to format doctor name properly
  const formatDoctorName = (name) => {
    if (!name) return "Doctor";
    
    // If name already has Dr. prefix, return as is
    if (name.toLowerCase().startsWith('dr.')) {
      return name;
    }
    
    // If it's an email-based name (contains @ or looks like email prefix)
    if (name.includes('@') || name.toLowerCase().includes('email')) {
      return `Dr. ${name}`;
    }
    
    // For full names, check if it needs Dr. prefix
    const words = name.trim().split(' ');
    if (words.length > 1 && !name.toLowerCase().startsWith('dr')) {
      return `Dr. ${name}`;
    }
    
    return name.includes(' ') ? name : `Dr. ${name}`;
  };

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
        <Image
          source={require("../assets/vescueye-logo.png")}
          style={styles.logo}
        />
        <Text style={styles.header}>
          {greeting.timeGreeting}, {formatDoctorName(doctorName)}
        </Text>
        <Text style={styles.subHeader}>
          {greeting.contextualMessage}
        </Text>
        <Text style={styles.managementText}>
          Manage your activities smartly
        </Text>
      </View>

      {/* Bottom Buttons */}
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
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 6,
    textAlign: "center",
    fontStyle: "italic",
  },
  managementText: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 4,
    textAlign: "center",
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