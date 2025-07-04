import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // for back button

export default function PatientScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/background.jpg')} // Your background image here
      style={styles.container}
    >
    
      {/* Patient Details Section */}
      <View style={styles.content}>
        <Text style={styles.header}>Patient Screen</Text>
        <Text style={styles.description}>This is where patient details will be displayed.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Adjust the position as needed
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: semi-transparent background for better visibility
    borderRadius: 30,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Make sure the text is visible against the background
  },
  description: {
    fontSize: 16,
    color: '#fff', // Text color adjusted for visibility
  },
});
