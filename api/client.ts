import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: inject auth token ───
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch {
        // corrupted storage — ignore
      }
    }
  }
  return config;
});

// ─── Response Interceptor: handle 401 globally ───
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Only auto-logout if the user had a session (not on login failures)
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        try {
          const { state } = JSON.parse(stored);
          if (state?.accessToken) {
            localStorage.removeItem("auth-storage");
            window.location.href = "/";
          }
        } catch {
          // corrupted storage — ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
