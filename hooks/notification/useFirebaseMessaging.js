// useFirebaseMessaging.js - TEMPORARILY DISABLED
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Temporarily disabled Firebase imports
// import messaging from '@react-native-firebase/messaging';

export function useFirebaseMessaging({ accessToken }) {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    console.log('[FCM] Firebase messaging temporarily disabled');
    
    // Temporarily disabled Firebase messaging functionality
    // All Firebase-related code has been commented out to prevent initialization errors
    
    return () => {
      // Cleanup function - currently empty as Firebase is disabled
    };
  }, [accessToken]);
}