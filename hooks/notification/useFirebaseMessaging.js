// import { useEffect } from 'react';
// import { AppState } from 'react-native';
// import { getApp } from '@react-native-firebase/app';
// import {
//   getMessaging,
//   onMessage,
//   onNotificationOpenedApp,
//   getInitialNotification,
// } from '@react-native-firebase/messaging';
// import * as Notifications from 'expo-notifications';
// import { ensureAndroidChannel } from './setupChannel';
// import { getFcmToken, listenTokenRefresh, registerTokenWithBackend } from './registerToken';

// export function useFirebaseMessaging({ accessToken }) {
//   useEffect(() => {
//     let unsubMessage;
//     let unsubOpened;
//     let unsubAppState;

//     (async () => {
//       await ensureAndroidChannel();

//       // Get + register token
//       const token = await getFcmToken();
//       console.log("FMC Token",token)
//       if (token) await registerTokenWithBackend(token, accessToken);

//       // Keep backend updated on refresh
//       const unsubRefresh = listenTokenRefresh(async (t) => {
//         await registerTokenWithBackend(t, accessToken);
//       });

//       const m = getMessaging(getApp());

//       // Foreground message -> show local notif
//       unsubMessage = onMessage(m, async (remoteMessage) => {
//         const title =
//           (remoteMessage.notification && remoteMessage.notification.title) ||
//           (remoteMessage.data && remoteMessage.data.title) ||
//           'Notification';

//         const body =
//           (remoteMessage.notification && remoteMessage.notification.body) ||
//           (remoteMessage.data && remoteMessage.data.body) ||
//           '';

//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title,
//             body,
//             data: remoteMessage.data || {},
//             sound: 'default',
//             priority: Notifications.AndroidNotificationPriority.MAX,
//             color: '#FF6200EE',
//           },
//           trigger: null,
//         });
//       });

//       // Tapped while in background
//       unsubOpened = onNotificationOpenedApp(m, (remoteMessage) => {
//         console.log('Tapped notification:', remoteMessage?.data);
//         // navigate based on data if needed
//       });

//       // App launched from killed state
//       const initial = await getInitialNotification(m);
//       if (initial) {
//         console.log('Opened from quit:', initial.data);
//       }

//       // Optional: re-check token when app returns to foreground
//       unsubAppState = AppState.addEventListener('change', async (state) => {
//         if (state === 'active') {
//           const t = await getFcmToken();
//           if (t) await registerTokenWithBackend(t, accessToken);
//         }
//       });

//       // cleanup including refresh listener
//       return () => unsubRefresh();
//     })();

//     return () => {
//       unsubMessage && unsubMessage();
//       unsubOpened && unsubOpened();
//       unsubAppState && unsubAppState.remove && unsubAppState.remove();
//     };
//   }, [accessToken]);
// }



// useFirebaseMessaging.js
import { useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import notifee, { AndroidStyle, EventType } from '@notifee/react-native';
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

const BRAND_COLOR = '#5F259F';

export function useFirebaseMessaging({ accessToken }) {
  const initRef = useRef(false);                // prevent StrictMode double run
  const hasRegisteredThisLaunchRef = useRef(false); // register only once per launch
  const registeringRef = useRef(false);         // simple mutex
  const unsubRefreshRef = useRef(null);
  const unsubMessageRef = useRef(null);
  const unsubOpenedRef = useRef(null);
  const unsubNotifeeRef = useRef(null);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        // 1) OS notification permissions (optional but recommended)
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
        const token =
          (await getFcmToken()) || (await messaging().getToken());

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
          const title =
            remoteMessage?.notification?.title ||
            remoteMessage?.data?.title ||
            'Notification';
          const body =
            remoteMessage?.notification?.body ||
            remoteMessage?.data?.body ||
            '';

          const displayedWithNotifee = await maybeDisplayRichNotification(remoteMessage);
          if (displayedWithNotifee) return;

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
        });

        // 7) Opened from killed state
        try {
          const initial = await getInitialNotification(m);
          if (initial) {
            console.log('[FCM] Opened from quit:', initial.data);
          }
        } catch { }

        // 8) Token refresh - always re-register (this bypasses the one-per-launch rule)
        unsubRefreshRef.current = listenTokenRefresh(async (t) => {
          console.log('[FCM] token refresh:', t || '(null)');
          if (!t) return;
          // On refresh we DO want to call backend again (fresh binding)
          await safeRegisterBackendOnce({ token: t, accessToken, registeringRef });
        });

        // 9) Foreground action buttons from Notifee
        unsubNotifeeRef.current = notifee.onForegroundEvent(async ({ type, detail }) => {
          if (type !== EventType.ACTION_PRESS) return;
          const actionId = detail?.pressAction?.id;
          const data = detail?.notification?.data || {};

          console.log('[FCM] Action pressed:', actionId, data);

          if (data.action_url) {
            Linking.openURL(data.action_url).catch(() => { });
            return;
          }

          if (data.deep_link) {
            Linking.openURL(data.deep_link).catch(() => { });
            return;
          }
        });
      } catch (e) {
        console.warn('[FCM] init error:', e?.message || e);
      }
    })();

    return () => {
      try { unsubMessageRef.current && unsubMessageRef.current(); } catch { }
      try { unsubOpenedRef.current && unsubOpenedRef.current(); } catch { }
      try { unsubRefreshRef.current && unsubRefreshRef.current(); } catch { }
      try { unsubNotifeeRef.current && unsubNotifeeRef.current(); } catch { }
    };
  }, [accessToken]);
}

/** Register only once per app launch (ignores navigation/rerenders). */
async function maybeRegisterOncePerLaunch({
  token,
  accessToken,
  hasRegisteredThisLaunchRef,
  registeringRef,
}) {
  if (!token) return;
  if (hasRegisteredThisLaunchRef.current) return;

  await safeRegisterBackendOnce({ token, accessToken, registeringRef });

  // mark as done for this launch
  hasRegisteredThisLaunchRef.current = true;
}

/** Mutexed backend call to avoid overlapping duplicate posts. */
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

async function maybeDisplayRichNotification(remoteMessage) {
  const data = remoteMessage?.data || {};
  const notification = remoteMessage?.notification || {};
  const hasActions = data?.has_actions === 'true';
  const hasImage = Boolean(data?.image_url);

  if (!hasActions && !hasImage) return false;

  const template = buildTemplateForData({ data, notification });
  const actions = template.actions || [];

  const channelSound = await getSystemNotificationSoundUrl();

  try {
    await notifee.displayNotification({
      title: template.title,
      body: template.body,
      subtitle: template.subtitle,
      android: {
        channelId: NOTIFICATION_CHANNEL_ID,
        sound: channelSound || 'default',
        color: BRAND_COLOR,
        style: data?.image_url
          ? { type: AndroidStyle.BIGPICTURE, picture: data.image_url }
          : undefined,
        actions: actions.length ? actions : undefined,
        pressAction: {
          id: template.pressActionId || 'open_app',
        },
      },
      data,
    });
    return true;
  } catch (err) {
    console.warn('[FCM] notifee display failed:', err?.message || err);
    return false;
  }
}

function buildTemplateForData({ data, notification }) {
  const template = (data?.template || data?.type || '').toLowerCase();
  const titleFromPayload = notification?.title || data?.title;
  const bodyFromPayload = notification?.body || data?.body;

  const templates = {
    recharge_success: () => ({
      title: titleFromPayload || 'Recharge successful',
      body:
        bodyFromPayload ||
        `₹${data?.amount || '0'} recharge for ${data?.phone || 'your number'} is done.`,
      subtitle: 'Mobile recharge',
      actions: [
        { title: 'View receipt', pressAction: { id: 'view_receipt' } },
        { title: 'Recharge again', pressAction: { id: 'repeat_recharge' } },
      ],
      pressActionId: 'open_recharge',
    }),
    bbps_payment_success: () => ({
      title: titleFromPayload || 'Bill paid successfully',
      body:
        bodyFromPayload ||
        `${data?.biller || 'Bill'} for ₹${data?.amount || '0'} paid via BBPS.`,
      subtitle: 'BBPS payment',
      actions: [
        { title: 'View receipt', pressAction: { id: 'view_receipt' } },
        { title: 'Raise issue', pressAction: { id: 'support_ticket' } },
      ],
      pressActionId: 'open_bbps',
    }),
    prime_membership: () => ({
      title: titleFromPayload || 'Prime activated',
      body:
        bodyFromPayload ||
        'Your Prime plan is live. Enjoy rewards and priority support.',
      subtitle: 'Membership',
      actions: [
        { title: 'Explore benefits', pressAction: { id: 'prime_benefits' } },
        { title: 'Manage plan', pressAction: { id: 'manage_plan' } },
      ],
      pressActionId: 'open_prime',
    }),
    meeting_update: () => ({
      title: titleFromPayload || 'Meeting updated',
      body:
        bodyFromPayload ||
        `Your meeting "${data?.meeting_title || 'Team sync'}" was updated.`,
      subtitle: 'Meeting',
      actions: [
        { title: 'Join now', pressAction: { id: 'join_meeting' } },
        { title: 'View details', pressAction: { id: 'view_meeting' } },
      ],
      pressActionId: 'open_meeting',
    }),
  };

  if (template && templates[template]) return templates[template]();

  return {
    title: `<p style="color: ${BRAND_COLOR};"><b>${titleFromPayload || 'Notification'}</span></p></b></p>`,
    body: bodyFromPayload || '',
    subtitle: '',
    actions: [],
    pressActionId: 'open_app',
  };
}

