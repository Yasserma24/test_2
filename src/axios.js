import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://192.168.1.17:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json.,",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    console.log("Interceptor - Token:", token);
    axiosInstance.defaults.headers[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("authToken")}`;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("No token found !");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      alert("Unauthorized! Please log in again.");
      localStorage.removeItem("authToken");
      window.location.href = "/SignIn"; // Adjust as needed
    } else if (error.response?.status === 500) {
      alert("Server error! Please try again later.");
    } else {
      alert("An error occurred. Please try again.");
    }
    return Promise.reject(error); // Reject for component-specific handling
  }
);

export default axiosInstance;
