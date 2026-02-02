import axios from "axios";

const baseURL = "/api";
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;

