import axios from "axios";

const baseURL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || "https://interviewos-n8i0.onrender.com") + "/api"
  : "/api";
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

export default axiosInstance;

