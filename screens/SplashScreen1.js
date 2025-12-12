import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";

import Theme from "../components/Theme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const SplashScreen1 = () => {
  const [showNextButton, setShowNextButton] = useState(false);
  const navigation = useNavigation();

  // ✅ Navigation logic without API logic
  const SimDetectionRoute = () => {
    navigation.navigate("Register"); // or adjust logic as needed
  };

  // ✅ Timer to show button
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNextButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.secondary }}>
      <View style={styles.container}>
      <Image
        source={require("../assets/Lcr2GIF.gif")}
        style={styles.backgroundVideo}
        contentFit="cover"
      />

      {showNextButton && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={SimDetectionRoute}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
};

// ✅ Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.secondary,
  },
  buttonContainer: {
    position: "absolute",
    bottom: "5%",
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    shadowColor: "#ff6f61",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: Theme.colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
});

export default SplashScreen1;
