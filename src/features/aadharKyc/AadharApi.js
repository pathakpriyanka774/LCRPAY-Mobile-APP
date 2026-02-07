import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../userRegister/UserRegister";

const BASE_URL = "https://bbpslcrapi.lcrpay.com"; // Change this if needed

// const BASE_URL = `http://192.168.1.5:8000`

// Generic API Request Function
// const apiRequest = async (method, endpoint, data = null) => {
//   try {
//     const access_token = await getToken(); // Retrieve access token
//     const session_id = await AsyncStorage.getItem("session_id"); // Retrieve session ID

//     const headers = {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${access_token}`, // Attach token
//       session_id: session_id || "", // Attach session_id if available
//     };

//     const response = await axios({
//       method,
//       url: `${BASE_URL}/${endpoint}`,
//       data,
//       headers,
//       withCredentials: true, // Ensure cookies are sent
//     });

//     return response.data;
//   } catch (error) {
//     console.error(
//       `Error in ${endpoint}:`,
//       error?.response?.data || error.message
//     );
//     throw error?.response?.data || { message: "Something went wrong" };
//   }
// };

const apiRequest = async (method, endpoint, data = null) => {
  const maxRetries = 3;
  const retryDelay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const access_token = await getToken();
      const session_id = await AsyncStorage.getItem("session_id");
      console.log(`[apiRequest] Session ID: ${session_id}, Endpoint: ${endpoint}, Attempt: ${attempt}`);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
         ...(session_id ? { Cookie: `session_id=${session_id}` } : {}),
      };

      const response = await axios({
        method,
        url: `${BASE_URL}/${endpoint}`,
        data,
        headers,
        withCredentials: true,
        timeout: 10000,
      });

      console.log(`[apiRequest] Response for ${endpoint}:`, response.data);
      return response.data;
      
    } catch (error) {
      console.log(`[apiRequest] Attempt ${attempt} failed for ${endpoint}:`, error.message);
      
      const isNetworkError = error.code === 'ECONNABORTED' || 
                           error.code === 'ENOTFOUND' ||
                           error.code === 'ECONNREFUSED' ||
                           (error.response && error.response.status >= 500);
      
      if (isNetworkError && attempt < maxRetries) {
        console.log(`[apiRequest] Retrying ${endpoint} in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // Handle final error
      if (isNetworkError) {
        console.warn(`[apiRequest] Network connectivity issue detected for ${endpoint}. Returning null.`);
        return null; // Return null for network errors
      }
      
      // Only log errors that are not network-related
      console.error(`Error in ${endpoint}:`, error?.response?.data || error.message);
      
      // For other errors, still throw but with more context
      throw error?.response?.data || { message: "Something went wrong" };
    }
  }
};

// AadharInfo API Call (Stores session_id in AsyncStorage)
// export const AadharInfo = async () => {
//   try {
//     const data = await apiRequest("get", "InitiateSession/");

//     // Store session_id in AsyncStorage
//     const sessionId = data?.session_id;
//     if (sessionId) {
//       await AsyncStorage.setItem("session_id", sessionId);
//     } else {
//       console.warn("Session ID not found in response");
//     }

//     return data;
//   } catch (error) {
//     console.error("Error fetching Aadhaar info:", error);
//   }
// };

export const AadharInfo = async () => {
  try {
    const data = await apiRequest("get", "InitiateSession/");
    const sessionId = data?.session_id;
    if (sessionId) {
      await AsyncStorage.setItem("session_id", sessionId);
      console.log(`[AadharInfo] Session ID stored: ${sessionId}`); // Debug log'
    } else {
      console.warn("Session ID not found in response");
    }
    return data;
  } catch (error) {
    console.error("Error fetching Aadhaar info:", error);
    throw error;
  }
};

// AadharGenerateOtp API Call
export const AadharGenerateOtp = (data) =>
  apiRequest("post", "otp_generate/", data);

// AadharVerifyOtp API Call
export const AadharVerifyOtp = (data) =>
  apiRequest("post", "verify-otp/", data);

export const AadharDetail = (data) =>
  apiRequest("get", "userAadharDetail/", data);

export const PanDetail = (data) =>
  apiRequest("get", "getPanDetails/", data);

// PanVerify API Call
export const PanVerify = (data) => apiRequest("post", "verify-pan", data);
