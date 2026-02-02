import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL + "/api"
  : "/api"; // fallback to relative path if env var is missing

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
