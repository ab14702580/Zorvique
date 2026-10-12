import axios from "axios";

let pendingPageDataRequests = 0;
const pageDataListeners = new Set();

const notifyPageDataListeners = () => {
  pageDataListeners.forEach((listener) => listener());
};

const finishPageDataRequest = (config) => {
  if (!config?.tracksPageData) return;
  config.tracksPageData = false;
  pendingPageDataRequests = Math.max(0, pendingPageDataRequests - 1);
  notifyPageDataListeners();
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === "get") {
    config.tracksPageData = true;
    pendingPageDataRequests += 1;
    notifyPageDataListeners();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    finishPageDataRequest(response.config);
    return response;
  },
  (error) => {
    finishPageDataRequest(error.config);
    return Promise.reject(error);
  },
);

export const subscribeToPageData = (listener) => {
  pageDataListeners.add(listener);
  return () => pageDataListeners.delete(listener);
};

export const getPendingPageDataRequests = () => pendingPageDataRequests;

export default api;
