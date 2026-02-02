
import axios from "axios";

const baseURL = import.meta.env.PROD ? "" : "/api";
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
