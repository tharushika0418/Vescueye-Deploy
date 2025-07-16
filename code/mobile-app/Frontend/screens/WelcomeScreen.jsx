import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);

    return (
        <View style={styles.container}>
            {/* Background Image with Loading Spinner */}
            <Image
                source={require('../assets/background.webp')} // ✅ Use local image
                style={styles.backgroundImage}
                onLoadEnd={() => setLoading(false)}
            />

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#10e0f8" />
                </View>
            )}

            {/* Overlay to darken background */}
            <View style={styles.overlay} />

            {/* Main Content */}
            <View style={styles.content}>
                {/* Logo */}
                <Image source={require('../assets/vescueye-logo.png')} style={styles.logo} />

                <Text style={styles.heading}>Welcome to VescuEye

                </Text>
            
                <Text style={styles.introduction}>
                VescuEye is an advanced vein visualization solution designed exclusively for doctors, particularly for use in free flap surgery. Utilizing near-infrared (NIR) technology, it enables real-time monitoring of blood flow to transplanted tissues, ensuring continuous perfusion. This helps in early detection of vascular complications, improving surgical precision and patient outcomes.
                </Text>

                {/* Login Button */}
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // ✅ Ensures full coverage
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // ✅ Darkens background for better text visibility
    },
    loaderContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    content: {
        alignItems: 'center',
        width: '80%',
    },
    logo: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    heading: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    introduction: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    bottomButtonsContainer: {
        marginTop: 100,
        width: '100%',
        alignItems: 'center',
    },
    loginButton: {
        borderWidth: 2,
        borderColor: 'transparent',
        paddingVertical: 20,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#10e0f8',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
