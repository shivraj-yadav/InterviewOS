import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api", // ensure /api is appended once
  withCredentials: true,
});

export default axiosInstance;
