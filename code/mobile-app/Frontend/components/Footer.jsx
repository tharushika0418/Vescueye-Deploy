import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Footer = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.text}>
                © {new Date().getFullYear()} Vescueye. All rights reserved. Unauthorized use is strictly prohibited.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: 'rgb(18,52,73,)', // Dark background for a professional look
        padding: 10,
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    text: {
        color: "#ccc",
        fontSize: 12,
        textAlign: "center",
    },
});

export default Footer;
