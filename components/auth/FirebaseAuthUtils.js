// FirebaseAuthUtils.js (modular, v22+) - TEMPORARILY DISABLED
import { Platform } from 'react-native';

const WEB_CLIENT_ID = '878982490513-6gkcdrfb4j7kgrvuh1m81obsbef3rtjv.apps.googleusercontent.com'

export function configureGoogleSignin() {
  // Temporarily disabled - Firebase not configured
  console.log('Google Sign-in configuration disabled');
}

export function onAuthChanged(callback) {
  // Temporarily disabled - Firebase not configured
  console.log('Firebase auth state change listener disabled');
  return () => {}; // Return empty unsubscribe function
}

export async function signInWithGoogle() {
  throw new Error('Google Sign-in temporarily disabled - Firebase not configured');
}

export async function userLogout() {
  // Temporarily disabled - Firebase not configured
  console.log('Firebase logout disabled');
}

export function mapGoogleError(error) {
  if (!error || !error.code) return 'Something went wrong. Please try again.';
  return error.message || 'An unknown error occurred.';
}