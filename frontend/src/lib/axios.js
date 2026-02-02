import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL + "/api"
  : "/api";

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

// Add request interceptor to debug actual URLs
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request URL:", config.baseURL + config.url);
    console.log("Full config:", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

