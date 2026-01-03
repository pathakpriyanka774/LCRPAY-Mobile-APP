import { registerRootComponent } from 'expo';
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
import messaging from '@react-native-firebase/messaging';
// import { NOTIFICATION_CHANNEL_ID, getSystemNotificationSoundUrl } from './hooks/notification/setupChannel';
import { navigateToNotification } from './RootNavigation';

// Temporarily disabled Notifee functionality
// notifee.registerForegroundService(notification => {
//   return new Promise(resolve => {
//     // ... foreground service code commented out
//     resolve();
//   });
// });

// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   // ... background event handling commented out
// });

// Basic FCM background message handler without Notifee
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
  // Basic handling without Notifee - you can implement basic notifications here
});

registerRootComponent(App);
