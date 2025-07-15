import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';

const ResetPassword = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!token.trim()) {
      Alert.alert("Error", "Please enter the reset token from your email.");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://172.20.10.6:5001/api/auth/reset-password/${token.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          "Success", 
          "Password reset successful! You can now login with your new password.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to reset password.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      <Text style={styles.instruction}>
        Enter the reset token from your email and choose a new password.
      </Text>

      <TextInput
        style={styles.tokenInput}
        placeholder="Paste reset token here"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        multiline={true}
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleResetPassword} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  tokenInput: { 
    width: '100%', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    marginBottom: 15,
    fontSize: 14,
    height: 80,
    backgroundColor: '#f8f9fa'
  },
  input: { 
    width: '100%', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    marginBottom: 15,
    fontSize: 16
  },
  button: { 
    width: '100%', 
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 5, 
    alignItems: 'center' 
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  backButton: { 
    marginTop: 15, 
    padding: 10 
  },
  backButtonText: { 
    color: '#007bff', 
    fontSize: 16 
  },
});

export default ResetPassword;