import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";  // Adjust path based on your structure
import ProfileScreen from "./screens/ProfileScreen";
import Footer from "./components/Footer";  // Import the global footer

const Stack = createStackNavigator();

const AppLayout = () => {
    return (
        <NavigationContainer>
            <View style={styles.container}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </Stack.Navigator>

                {/* Footer included globally */}
                <Footer />
            </View>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AppLayout;
