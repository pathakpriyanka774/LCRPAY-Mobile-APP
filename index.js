import { registerRootComponent } from 'expo';
// Notifee temporarily removed - using Expo notifications
// import notifee, {
//   AndroidForegroundServiceType,
//   AndroidColor,
//   AndroidStyle,
//   AndroidImportance,
//   EventType,
// } from '@notifee/react-native';
import App from './App';
import NetInfo from '@react-native-community/netinfo';
import { AppState, Linking, Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging'; // Temporarily disabled
import * as Notifications from 'expo-notifications';
// import { NOTIFICATION_CHANNEL_ID, getSystemNotificationSoundUrl } from './hooks/notification/setupChannel';

// Commented out Notifee code temporarily
/*
notifee.registerForegroundService(notification => {
  return new Promise(resolve => {
    let prevAppState = AppState.currentState;
    let appStateSubscription = null;
    let unsubscribeNetworkUpdate = null;
    let permissionCheckInterval = null;

    const stopService = async () => {
      console.warn('Stopping service.');
      if (notification?.id) {
        await notifee.cancelNotification(notification?.id);
      }
      await notifee.stopForegroundService();
      if (typeof unsubscribeNetworkUpdate === 'function') {
        unsubscribeNetworkUpdate();
      }
      if (appStateSubscription) {
        if (typeof appStateSubscription.remove === 'function') {
          appStateSubscription.remove();
        }
        appStateSubscription = null;
      }
      if (permissionCheckInterval) {
        clearInterval(permissionCheckInterval);
        permissionCheckInterval = null;
      }
      return resolve();
    };

    const handleNoInternet = async () => {
      //when internet is off, display no internet notification.
      let granted = await checkNotificationPermissionStatus();
      if (granted) {
        //if no internet and notification permission granted, show lost connectivity status
        notifee.displayNotification({
          id: FGSNotificationId,
          title: '<p style="color: #4caf50;"><b>No Internet</p></b></p>',
          body: '<p style="color: #4caf50;">Please connect to internet to get latest data from server</p></p>',
          android: {
            foregroundServiceTypes: [
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            ],
            smallIcon: 'ic_small_icon',
            color: AndroidColor.BLACK,
            ongoing: false,
            autoCancel: false, // Defaults to true
            onlyAlertOnce: true,
            asForegroundService: true,
            channelId: FGSChannelId,
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
              id: 'default',
            },
          },
        });
      } else {
        stopService();
      }
    };

    appStateSubscription = AppState.addEventListener('change', nextAppState => {
      //console.log('app state changed');
      if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        //console.log('App came foreground');
        if (typeof unsubscribeNetworkUpdate === 'function') {
          unsubscribeNetworkUpdate();
        }
        if (permissionCheckInterval) {
          clearInterval(permissionCheckInterval);
          permissionCheckInterval = null;
        }
      } else if (
        prevAppState.match(/active/) &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        // console.log('App goes background/quit');
        permissionCheckInterval = setInterval(async () => {
          //if app is in background check latest permission status every 1 min.
          let granted = await checkNotificationPermissionStatus();
          if (!granted) {
            //if notification permission is denied, stop FG service.
            stopService();
          }
        }, 60000);

        //Subscribe to network state updates
        unsubscribeNetworkUpdate = NetInfo.addEventListener(state => {
          if (state.isConnected) {
            // console.log('Internet connected');
            //if internet is on, get updated data from server and show updated notification using notifee.displayNotification
          } else {
            handleNoInternet();
          }
        });
      }
      prevAppState = nextAppState;
    });
  });
});


notifee.onBackgroundEvent(async ({ type, detail }) => {
  // Open deep links for notification taps or action button presses in background/killed state
  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) return;
  const data = detail?.notification?.data || {};
  const actionUrl = data.action_url || data.deep_link;
  if (!actionUrl) return;
  try { await Linking.openURL(actionUrl); } catch {}
});
*/

// Ensure action buttons + big picture are rendered when a data message arrives in background/quit
// Temporarily disabled Firebase messaging
/*
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // If FCM includes a notification payload, the OS will already display it.
  // Skip our manual render to avoid duplicate cards.
  if (remoteMessage?.notification) return;

  const data = remoteMessage?.data || {};
  const title = remoteMessage?.notification?.title || data.title || 'Notification';
  const body = remoteMessage?.notification?.body || data.body || '';

  // Use Expo notifications instead of Notifee
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#FF6200EE',
      },
      trigger: null,
    });
  } catch (e) {
    console.warn('Background notification error:', e?.message || e);
  }
});
*/
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
