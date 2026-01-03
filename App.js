import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppNavigator from "./AppNavigator";
import { store } from "./src/app/store";
import { ensureAndroidChannel } from "./hooks/notification/setupChannel";
import { useFirebaseMessaging } from "./hooks/notification/useFirebaseMessaging";
import { configureGoogleSignin } from "./components/auth/FirebaseAuthUtils";
import * as Linking from "expo-linking";
import axios from "axios";
import { navigateToNotification } from "./RootNavigation";

import { getIntegrityToken } from "./utils/integrity";
import { BASE_URL } from "./utils/config";

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

    configureGoogleSignin();         // call exactly once

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
  useFirebaseMessaging({ accessToken, userId });



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
          return;
        }

        // Default: open app and go to Notifications
        navigateToNotification();
      }
    );

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const checkIngegrity = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          console.log("No access token found, skipping integrity check.");
          return;
        }
        const { token, nonce } = await getIntegrityToken();
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Integrity-Token": token,
          "X-Integrity-Nonce": nonce,

        };
        const res = await axios.post(`${BASE_URL}/security/verify-device`, {
          integrity_token: token,
          nonce,
        }, { headers });
        console.log(res.data, "------------------------------>")
        if (!res.data.allowed) {
          throw new Error("Device / app failed integrity: " + res.data.reason);
        }

      } catch (error) {
        console.log(error)
      }
    }
    checkIngegrity();
  }, [])



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}
