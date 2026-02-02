import axios from "axios";

const baseURL = import.meta.env.PROD 
  ? "https://interviewos-n8i0.onrender.com/api" 
  : "/api";
console.log("Axios baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;

