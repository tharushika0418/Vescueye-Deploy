import React, { useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
 
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView,
  Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://172.20.10.6:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store both the token and user email in AsyncStorage
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userEmail", data.user.email);
        await AsyncStorage.setItem("userRole", data.user.role);
        await AsyncStorage.setItem("userId", data.user.id);
        
        console.log('User logged in:', data);
        console.log('Stored email:', data.user.email);
        
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.innerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Image source={require('../assets/vescueye-logo.png')} style={styles.logo} />
          <Text style={styles.header}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#465a6e',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    marginBottom: 12,
    width: '80%',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#10e0f8',
    paddingVertical: 12,
    width: '80%',
    alignItems: 'center',
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});