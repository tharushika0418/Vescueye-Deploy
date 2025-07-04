import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated, ImageBackground } from 'react-native';

export default function SplashScreen({ navigation }) {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        // Fade-in animation for logo
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();

        // Navigate to Welcome Screen after 3 seconds
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                    <Image source={require('../assets/vescueye-logo.png')} style={styles.logo} />
                </Animated.View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Ensure the background image covers the entire screen
        position: 'absolute',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 230,
        height: 230,
        resizeMode: 'contain',
    },
});