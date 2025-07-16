import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Import assets
import logo from '../assets/vescueye-logo.png';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');

  const handleRoleChange = (itemValue) => {
    try {
      console.log('Attempting to change role to:', itemValue);
      setRole(itemValue);
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://172.25.224.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('User signed up:', data);
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderPicker = () => {
    const pickerStyle = { fontSize: 14 }; // Adjust the font size here

    if (Platform.OS === 'ios') {
      return (
          <View style={[styles.input, styles.pickerContainerIOS]}>
            <Picker
                selectedValue={role}
                onValueChange={handleRoleChange}
                itemStyle={[styles.pickerItemIOS, pickerStyle]}  // Apply font size here
                style={styles.pickerIOS}
            >
              <Picker.Item label="Patient" value="patient" color="#fff" />
              <Picker.Item label="Doctor" value="doctor" color="#fff" />
              <Picker.Item label="Admin" value="admin" color="#fff" />
            </Picker>
          </View>
      );
    }

    return (
        <View style={[styles.input, styles.pickerContainerAndroid]}>
          <Picker
              selectedValue={role}
              onValueChange={handleRoleChange}
              mode="dropdown"
              style={[styles.pickerAndroid, pickerStyle]}  // Apply font size here
              dropdownIconColor="#fff"
          >
            <Picker.Item label="Patient" value="patient" style={[styles.pickerItemAndroid, pickerStyle]} />
            <Picker.Item label="Doctor" value="doctor" style={[styles.pickerItemAndroid, pickerStyle]} />
            <Picker.Item label="Admin" value="admin" style={[styles.pickerItemAndroid, pickerStyle]} />
          </Picker>
        </View>
    );
  };

  return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
              <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <Image source={logo} style={styles.logo} />
              <Text style={styles.header}>Create Account</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
              />

              <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
              />

              <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Role:</Text>
                {renderPicker()}
              </View>

              <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(70,90,110)',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 12,
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainerAndroid: {
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerAndroid: {
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerItemAndroid: {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerContainerIOS: {
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerIOS: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  pickerItemIOS: {
    height: 50,
    color: '#fff',
  },
  signUpButton: {
    marginTop: 20,
    backgroundColor: '#10e0f8',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
  },
  signUpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
