import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
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
import ResetPassword from './screens/ResetPassword';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);

const Stack = createStackNavigator();

// Update with your backend base URL (no trailing slash)
const BASE_URL = 'http://172.20.10.6:5001/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  //shouldShowBanner
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [pendingNavigation, setPendingNavigation] = useState(null);

  useEffect(() => {

    // Listen for notification responses (user taps on notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const data = response.notification.request.content.data;
        const { navigateTo, params } = data || {};
        const isLoggedIn = await checkAuthStatus();

      if (navigateTo) {

        if (isLoggedIn) {
          navigationRef.current?.navigate(navigateTo, params || {});
        } else {
          setPendingNavigation({ screen: navigateTo, params: params || {} });
          navigationRef.current?.navigate('Login');
        }
      }
      } catch (err) {
        console.error('Error handling notification response:', err);
      }
    });

    return () => subscription.remove();
  }, []);

  // Check if user is logged in by verifying stored token
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch {
      return false;
    }
  };

  // After login success, navigate to pending screen if any
  const handleLoginSuccess = () => {
    if (pendingNavigation) {
      const { screen, params } = pendingNavigation;
      navigationRef.current?.navigate(screen, params);
      setPendingNavigation(null);
    } else {
      navigationRef.current?.navigate('Home');
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
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="LiveFlapScreen" component={LiveFlapScreen} />
        <Stack.Screen name="Dashboard" component={DoctorDashboard} />
        <Stack.Screen name="Patients" component={PatientScreen} />
        <Stack.Screen name="ImageViewer" component={ImageViewer} />
     
      </Stack.Navigator>
    </NavigationContainer>
  );
}

