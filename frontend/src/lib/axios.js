import axios from "axios";

const isProduction = import.meta.env.MODE === 'production' || !import.meta.env.DEV;
console.log("Environment mode:", import.meta.env.MODE);
console.log("Is production:", isProduction);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

const baseURL = isProduction 
  ? "https://interviewos-n8i0.onrender.com/api"
  : "/api";
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

export default axiosInstance;

