import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL + "/api"
  : "/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

export default axiosInstance;

