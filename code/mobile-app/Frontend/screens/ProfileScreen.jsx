import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Replace with your actual profile image placeholder
import profilePlaceholder from '../assets/default-profile-pic.png';
import backgroundImage from '../assets/background.jpg';

export default function ProfileScreen({ navigation }) {
    return (
        <View style={{ flex: 1 }}>
            {/* Background container with overlay */}
            <View style={styles.backgroundContainer}>
                <Image source={backgroundImage} style={styles.backgroundImage} />
                <View style={styles.overlay} />
            </View>

            {/* Profile container */}
            <View style={styles.container}>
                <Image source={profilePlaceholder} style={styles.profileImage} />
                <Text style={styles.userName}>Test Doctor</Text>
                <Text style={styles.userEmail}>doctor@test.com</Text>

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        position: 'absolute',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'white',
        marginBottom: 20,
    },
    userName: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        color: 'white',
        fontSize: 18,
        marginBottom: 30,
    },
    editButton: {
        backgroundColor: '#10e0f8',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    logoutButton: {
        borderWidth: 2,
        borderColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        width: '80%',
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
