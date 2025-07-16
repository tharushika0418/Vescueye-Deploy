import Constants from 'expo-constants';
import { Platform } from 'react-native'; // Add this import
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import AsyncStorage from '@react-native-async-storage/async-storage';
const { LOCALHOST, DEPLOYED_URL } = Constants.expoConfig.extra;
const API_URL = DEPLOYED_URL||LOCALHOST ;

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('❌ Must use physical device for push notifications');
    return;
  }

  // Get doctor ID from storage
  let doctorId;
  try {
    doctorId = await AsyncStorage.getItem('doctorId');
    if (!doctorId) {
      console.log('No doctor ID found - skipping token registration');
      return;
    }
  } catch (err) {
    console.log('Error getting doctor ID:', err);
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    console.log('✅ Expo Push Token:', expoPushToken);
    await sendPushTokenToBackend(expoPushToken, doctorId);
    
    // Android-specific configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  } catch (err) {
    console.log('❌ Error getting Expo Push Token:', err);
  }
};

const sendPushTokenToBackend = async (token, doctorId) => {
  try {
    // const API_URL = "http://172.20.10.6:5001";
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await fetch(`${API_URL}/api/savePushToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ 
        token: token,
        doctorId: doctorId 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save push token');
    }
    console.log('✅ Push token saved successfully');
  } catch (err) {
    console.log('❌ Error saving push token:', err);
  }
};