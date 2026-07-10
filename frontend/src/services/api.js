import axios from "axios";

// Environment variable se URL uthao, nahi toh localhost use karo
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// JWT token ko har request ke saath bhejne ke liye interceptor
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    // ignore corrupt auth storage
  }
  return config;
});

export default api;