import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export default function NotificationHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const imageUrl = response.notification.request.content.data.imageUrl;

      if (imageUrl) {
        console.log('📷 Received image URL from push notification:', imageUrl);
        navigation.navigate('ImageViewer', { imageUrl });
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
