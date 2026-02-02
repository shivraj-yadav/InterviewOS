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

export default axiosInstance;

