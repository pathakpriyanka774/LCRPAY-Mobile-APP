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
  try {
    const access_token = await getToken();
    const session_id = await AsyncStorage.getItem("session_id");
    console.log(`[apiRequest] Session ID: ${session_id}, Endpoint: ${endpoint}`); // Debug log

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
    });

    console.log(`[apiRequest] Response for ${endpoint}:`, response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error?.response?.data || error.message);
    throw error?.response?.data || { message: "Something went wrong" };
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
