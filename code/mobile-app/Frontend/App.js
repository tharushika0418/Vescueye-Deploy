import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './navigation/RootNavigation';

// Screens
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SigupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PatientScreen from './screens/PatientScreen';
import ForgotPassword from './screens/ForgotPassword';
import LiveFlapScreen from './screens/LiveFlapScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import ImageViewer from './screens/ImageViewer';

const Stack = createStackNavigator();

// ✅ Show notifications even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [pendingNavigation, setPendingNavigation] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // ✅ Handle tap on notification
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data;
      
      if (data.navigateTo) {
        console.log('📱 Notification tapped, checking auth status...');
        
        // Check if user is logged in
        const isLoggedIn = await checkAuthStatus();
        
        if (isLoggedIn) {
          // User is logged in, navigate directly
          console.log('✅ User logged in, navigating to:', data.navigateTo);
          setTimeout(() => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate(data.navigateTo, data.params || {});
            }
          }, 100);
        } else {
          // User not logged in, store the intended destination and navigate to login
          console.log('🔐 User not logged in, redirecting to login...');
          setPendingNavigation({ screen: data.navigateTo, params: data.params || {} });
          
          setTimeout(() => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate('Login');
            }
          }, 100);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      // Check your auth method - could be AsyncStorage, SecureStore, or your auth context
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      
      // You can also check if token is still valid by making an API call
      return !!(token && userId);
      
    } catch (error) {
      console.log('❌ Error checking auth status:', error);
      return false;
    }
  };

  // Function to handle successful login
  const handleLoginSuccess = () => {
    if (pendingNavigation) {
      console.log('🎯 Login successful, navigating to pending destination:', pendingNavigation.screen);
      
      setTimeout(() => {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate(pendingNavigation.screen, pendingNavigation.params);
          setPendingNavigation(null); // Clear pending navigation
        }
      }, 100);
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen 
              {...props} 
              onLoginSuccess={handleLoginSuccess}
              pendingNavigation={pendingNavigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="LiveFlapScreen" component={LiveFlapScreen} />
        <Stack.Screen name="Dashboard" component={DoctorDashboard} />
        <Stack.Screen name="Patients" component={PatientScreen} />
        <Stack.Screen name="ImageViewer" component={ImageViewer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('❌ Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Permission not granted for push notifications.');
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('✅ Expo Push Token:', tokenData.data);
  } catch (err) {
    console.log('❌ Error getting Expo Push Token:', err);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}