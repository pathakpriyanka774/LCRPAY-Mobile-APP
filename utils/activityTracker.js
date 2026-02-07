import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// const BASE_URL = 'http://10.0.2.2:8000'; // Android emulator special IP
// const BASE_URL = 'http://192.168.31.132:8000'; // Local network IP  
const BASE_URL = 'https://bbpslcrapi.lcrpay.com'; // Production server

export const ACTIVITY_TYPES = {
  REGISTRATION: 'registration',
  LOGIN: 'login',
  LOGOUT: 'logout',
  RECHARGE: 'recharge',
  BILL_PAYMENT: 'bill_payment',
  MONEY_TRANSFER: 'money_transfer',
  WALLET_TOPUP: 'wallet_topup',
  PROFILE_UPDATE: 'profile_update',
  KYC_VERIFICATION: 'kyc_verification',
  MEMBERSHIP_PURCHASE: 'membership_purchase',
  SCAN_PAY: 'scan_pay',
  QR_PAYMENT: 'qr_payment',
  BANK_TRANSFER: 'bank_transfer',
  LOAN_APPLICATION: 'loan_application',
  INSURANCE_PURCHASE: 'insurance_purchase',
  COMPLAINT_FILED: 'complaint_filed',
  REFERRAL_USED: 'referral_used',
  REWARD_CLAIMED: 'reward_claimed',
  NOTIFICATION_OPENED: 'notification_opened',
  APP_OPENED: 'app_opened'
};

export const trackActivity = async (activityType, details = {}) => {
  // Make activity tracking completely optional and non-blocking
  try {
    const maxRetries = 2; // Reduced retries since it's non-critical
    const retryDelay = 500; // Faster retries
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          return; // Silently skip if no token
        }

        const payload = {
          activity_type: activityType,
          timestamp: new Date().toISOString(),
          details: {
            ...details,
            platform: 'mobile',
            app_version: '1.0.0'
          }
        };

        // Try the production endpoint
        const response = await axios.post(`${BASE_URL}/activity/track`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // Shorter timeout for non-critical feature
        });
        
        return; // Success, exit silently
        
      } catch (error) {
        const isNetworkError = error.code === 'ECONNABORTED' || 
                             error.code === 'ENOTFOUND' ||
                             error.code === 'ECONNREFUSED' ||
                             (error.response && error.response.status >= 500);
        
        // If it's a 404, the endpoint doesn't exist - don't retry
        if (error.response && error.response.status === 404) {
          return; // Silently skip - endpoint doesn't exist
        }
        
        if (isNetworkError && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // All errors are silently ignored for activity tracking
        return;
      }
    }
  } catch (error) {
    // Completely silent - activity tracking should never affect app functionality
    return;
  }
};