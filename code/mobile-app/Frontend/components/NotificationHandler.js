import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export default function PushTokenManager() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Permission for notifications was denied.');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;

      console.log('✅ Expo Push Token:', expoPushToken);

      // ✅ Send to your backend
      await fetch('http://172.20.10.6:5001/api/savePushToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: expoPushToken })
      });

      console.log('✅ Push token sent to backend');
    } catch (error) {
      console.error('❌ Error getting or sending push token:', error);
    }
  };

  return null;
};
