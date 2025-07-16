import 'dotenv/config';

export default {
  expo: {
    name: "Vescueye",
    slug: "Vescueye",
    version: "1.0.0",
    sdkVersion: "53.0.0",
    orientation: "portrait",
    icon: "./assets/vescueye-logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/vescueye-logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.vescueyetestuser.Vescueye",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/vescueye-logo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.vescueyetestuser.Vescueye"
    },
    web: {
      favicon: "./assets/vescueye-logo.png"
    },
    extra: {
      LOCALHOST: process.env.LOCALHOST,
      DEPLOYED_URL: process.env.DEPLOYED_URL,
      LOCALHOST_WEB : process.env.LOCALHOST_WEB,
      DEPLOYED_URL_WEB: process.env.DEPLOYED_URL_WEB,
      eas: {
        projectId: "f940952a-6476-4913-bb35-f669e2181817"
      }
    },
    owner: "vescueye-testuser"
  }
};
