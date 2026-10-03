import axios from "axios";

// In production VITE_API_URL points to the Render backend
// (e.g. https://interviewos-n8i0.onrender.com/api).
// In dev the Vite proxy forwards /api → http://localhost:3000/api,
// so we keep the relative base URL so the proxy still works.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // browser sends cookies automatically on every request
});

export default axiosInstance;
