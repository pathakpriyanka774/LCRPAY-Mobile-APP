import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Temporarily disabled Firebase imports
// import { getApp } from '@react-native-firebase/app';
// import {
//   getMessaging,
//   requestPermission,
//   AuthorizationStatus,
//   getToken,
//   onTokenRefresh,
// } from '@react-native-firebase/messaging';

export async function getFcmToken() {
  // Temporarily disabled - Firebase not configured
  console.log('FCM token retrieval disabled');
  return null;
}

export function listenTokenRefresh(cb) {
  // Temporarily disabled - Firebase not configured
  console.log('FCM token refresh listener disabled');
  return () => {}; // Return empty unsubscribe function
}

export async function registerTokenWithBackend(token) {
  const access_token = await AsyncStorage.getItem("access_token");
  try {
    const res = await fetch('https://bbpslcrapi.lcrpay.com/notification/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS, "app_version": "1.0.0" }),
    });

    console.log("Push Notification1----->", res, access_token)
  } catch (e) {
    console.warn('Failed to register FCM token:', e);
  }
}