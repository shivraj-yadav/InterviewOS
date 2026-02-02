
import axios from "axios";

// Use environment variable if set, otherwise fallback to relative API path
const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "/api";

console.log("Axios base URL:", baseURL); // optional: to verify in console

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
