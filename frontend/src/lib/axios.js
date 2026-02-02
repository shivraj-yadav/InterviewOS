import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL + "/api"
  : "/api";

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("Final baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

// Add request interceptor to debug
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("=== REQUEST DEBUG ===");
    console.log("BaseURL:", config.baseURL);
    console.log("URL:", config.url);
    console.log("Full URL:", config.baseURL + config.url);
    console.log("===================");
    return config;
  },
  (error) => {
    console.log("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to debug
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("=== RESPONSE DEBUG ===");
    console.log("Response URL:", response.config.baseURL + response.config.url);
    console.log("Status:", response.status);
    console.log("====================");
    return response;
  },
  (error) => {
    console.log("=== RESPONSE ERROR ===");
    console.log("Error URL:", error.config?.baseURL + error.config?.url);
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("======================");
    return Promise.reject(error);
  }
);

export default axiosInstance;

