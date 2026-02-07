module.exports = {
  dependencies: {
    // Completely disable Firebase auto-linking to prevent initialization errors
    '@react-native-firebase/app': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@react-native-firebase/analytics': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@react-native-firebase/auth': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@react-native-firebase/crashlytics': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@react-native-firebase/messaging': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};