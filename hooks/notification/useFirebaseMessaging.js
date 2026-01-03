// useFirebaseMessaging.js
import { useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
// import notifee, { AndroidStyle, EventType } from '@notifee/react-native';
import messaging, {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import {
  ensureAndroidChannel,
  getSystemNotificationSoundUrl,
  NOTIFICATION_CHANNEL_ID,
} from './setupChannel';
import { getFcmToken, listenTokenRefresh, registerTokenWithBackend } from './registerToken';
import { navigateToNotification } from '../../RootNavigation';

const BRAND_COLOR = '#5F259F';

export function useFirebaseMessaging({ accessToken }) {
  const initRef = useRef(false);
  const hasRegisteredThisLaunchRef = useRef(false);
  const registeringRef = useRef(false);
  const unsubRefreshRef = useRef(null);
  const unsubMessageRef = useRef(null);
  const unsubOpenedRef = useRef(null);
  // const unsubNotifeeRef = useRef(null);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        // 1) OS notification permissions
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.warn('[FCM] Notification permission not granted');
          }
        } catch (e) {
          console.warn('[FCM] Notifications permission error:', e?.message || e);
        }

        // 2) Android notification channel
        if (Platform.OS === 'android') {
          await ensureAndroidChannel();
        }

        // 3) FCM permission + device registration
        try { await messaging().requestPermission(); } catch { }
        try { await messaging().registerDeviceForRemoteMessages(); } catch { }

        // 4) Get token once and register ONCE per launch
        const token = (await getFcmToken()) || (await messaging().getToken());
        console.log('[FCM] token:', token || '(null)');

        await maybeRegisterOncePerLaunch({
          token,
          accessToken,
          hasRegisteredThisLaunchRef,
          registeringRef,
        });

        // 5) Foreground message handler
        const m = getMessaging(getApp());
        unsubMessageRef.current = onMessage(m, async (remoteMessage) => {
          const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Notification';
          const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';

          // Use basic Expo notifications instead of Notifee
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
                data: remoteMessage?.data || {},
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                color: '#FF6200EE',
              },
              trigger: null,
            });
          } catch (e) {
            console.warn('[FCM] scheduleNotification error:', e?.message || e);
          }
        });

        // 6) Background tap handler
        unsubOpenedRef.current = onNotificationOpenedApp(m, (remoteMessage) => {
          console.log('[FCM] Tapped (background):', remoteMessage?.data);
          navigateToNotification();
        });

        // 7) Opened from killed state
        try {
          const initial = await getInitialNotification(m);
          if (initial) {
            console.log('[FCM] Opened from quit:', initial.data);
            await navigateToNotification();
          }
        } catch { }

        // 8) Token refresh
        unsubRefreshRef.current = listenTokenRefresh(async (t) => {
          console.log('[FCM] token refresh:', t || '(null)');
          if (!t) return;
          await safeRegisterBackendOnce({ token: t, accessToken, registeringRef });
        });

        // 9) Notifee foreground events - temporarily disabled
        // unsubNotifeeRef.current = notifee.onForegroundEvent(async ({ type, detail }) => {
        //   // ... disabled
        // });
      } catch (e) {
        console.warn('[FCM] init error:', e?.message || e);
      }
    })();

    return () => {
      try { unsubMessageRef.current && unsubMessageRef.current(); } catch { }
      try { unsubOpenedRef.current && unsubOpenedRef.current(); } catch { }
      try { unsubRefreshRef.current && unsubRefreshRef.current(); } catch { }
      // try { unsubNotifeeRef.current && unsubNotifeeRef.current(); } catch { }
    };
  }, [accessToken]);
}

async function maybeRegisterOncePerLaunch({
  token,
  accessToken,
  hasRegisteredThisLaunchRef,
  registeringRef,
}) {
  if (!token) return;
  if (hasRegisteredThisLaunchRef.current) return;

  await safeRegisterBackendOnce({ token, accessToken, registeringRef });
  hasRegisteredThisLaunchRef.current = true;
}

async function safeRegisterBackendOnce({ token, accessToken, registeringRef }) {
  if (registeringRef.current) return;
  registeringRef.current = true;
  try {
    await registerTokenWithBackend(token, accessToken);
    console.log('[FCM] Registered device token with backend');
  } catch (e) {
    console.warn('[FCM] Backend registration failed:', e?.response?.status, e?.message || e);
  } finally {
    registeringRef.current = false;
  }
}

