import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase - temporarily disabled
// try {
//   require('./firebase');
// } catch (e) {
//   console.warn('Firebase initialization skipped:', e.message);
// }

import AppNavigator from "./AppNavigator";
import { store } from "./src/app/store";
import { ensureAndroidChannel } from "./hooks/notification/setupChannel";
// // import { useFirebaseMessaging } from "./hooks/notification/useFirebaseMessaging";
// import { configureGoogleSignin } from "./components/auth/FirebaseAuthUtils";
import * as Linking from "expo-linking";
import axios from "axios";

import { getIntegrityToken } from "./utils/integrity";

import { Buffer } from "buffer";
global.Buffer = Buffer;


// Global notification handler (once at module load)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowList: true,
    shouldPlaySound: true,  // ✅ Enable sound
    shouldSetBadge: true,
    shouldShowBanner: true
  }),
});

export default function App() {
  const initRef = useRef(false);
  const [accessToken, setAccessToken] = useState(null);
  // If you know the signed-in user id, pass it. Else omit.
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (initRef.current) return;     // ✅ guard for StrictMode double mount
    initRef.current = true;

    // configureGoogleSignin();         // Temporarily disabled until Firebase is configured

    (async () => {
      await Notifications.requestPermissionsAsync();
      if (Platform.OS === "android") {
        await ensureAndroidChannel();
      }
    })().catch(e => console.warn("Notification permission error:", e));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await AsyncStorage.getItem("access_token");
        if (mounted) setAccessToken(t || null);

        const uid = await AsyncStorage.getItem("user_id");
        if (mounted) setUserId(uid || null);
      } catch {
        if (mounted) {
          setAccessToken(null);
          setUserId(null);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ✅ This hook is idempotent (see below). It will only register once per (userId, deviceToken).
  // useFirebaseMessaging({ accessToken, userId }); // Temporarily disabled until Firebase is properly configured



  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const action = response.actionIdentifier;
        const data = response.notification.request.content.data;

        console.log("Notification pressed:", data);

        // Priority 1: Zoom deep link
        if (data.zoomus) {
          Linking.openURL(data.zoomus).catch(err =>
            console.warn("Cannot open zoom deep link:", err)
          );
          return;
        }

        // Priority 2: Zoom HTTPS link
        if (data.zoom_url) {
          Linking.openURL(data.zoom_url).catch(err =>
            console.warn("Cannot open zoom web link:", err)
          );
          return;
        }

        // Priority 3: Google Meet link
        if (data.meet_url) {
          Linking.openURL(data.meet_url).catch(err =>
            console.warn("Cannot open meet link:", err)
          );
          return;
        }

        // Priority 4: Any generic deep link
        if (data.deep_link) {
          Linking.openURL(data.deep_link).catch(err =>
            console.warn("Cannot open deep link:", err)
          );
        }
      }
    );

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const checkIntegrity = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          console.log("No access token found, skipping integrity check.");
          return;
        }
        
        const { token, nonce } = await getIntegrityToken();
        
        // Skip integrity check if token or nonce is null
        if (!token || !nonce) {
          console.log("Integrity check not available, continuing without verification.");
          return;
        }
        
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Integrity-Token": token,
          "X-Integrity-Nonce": nonce,
        };

        // Retry mechanism for network failures
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const res = await axios.post("https://bbpslcrapi.lcrpay.com/security/verify-device", {
              integrity_token: token,
              nonce,
            }, { 
              headers,
              timeout: 10000 // 10 second timeout
            });
            
            console.log(res.data, "------------------------------>")
            if (!res.data.allowed) {
              throw new Error("Device / app failed integrity: " + res.data.reason);
            }
            
            // Success - break out of retry loop
            console.log("Integrity check passed successfully");
            return;
            
          } catch (networkError) {
            console.log(`Integrity check attempt ${attempt} failed:`, networkError.message);
            
            // Check if it's a network/server error (5xx, 4xx, or network timeout)
            const isNetworkError = networkError.code === 'ECONNABORTED' || 
                                 networkError.code === 'ENOTFOUND' ||
                                 networkError.code === 'ECONNREFUSED' ||
                                 (networkError.response && networkError.response.status >= 500);
            
            if (isNetworkError && attempt < maxRetries) {
              console.log(`Retrying integrity check in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            // If it's the last attempt or not a network error, throw
            throw networkError;
          }
        }

      } catch (error) {
        console.log("Integrity check error after all retries:", error.message);
        
        // For network errors, allow app to continue with a warning
        if (error.code === 'ECONNABORTED' || 
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNREFUSED' ||
            (error.response && error.response.status >= 500)) {
          console.warn("Network connectivity issue detected. App will continue with limited functionality.");
          return;
        }
        
        // For other errors (like integrity failures), we might want to handle differently
        console.warn("Integrity verification failed. App will continue with reduced security.");
      }
    }
    
    // Add a small delay to ensure app is fully loaded
    setTimeout(checkIntegrity, 2000);
  }, [])



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}
