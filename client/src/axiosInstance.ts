import axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "./config";
import { store } from "./redux/app";
import { logoutUser, setAccessToken } from "./redux/features/authSlice";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};
    config.headers["Authorization"] = "Bearer " + store.getState().auth.accessToken;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest.url.includes("refresh")) {
      store.dispatch(logoutUser());
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && (originalRequest as any)._retry) {
      store.dispatch(logoutUser());
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("login") &&
      !(originalRequest as any)._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axiosInstance
          .post(`${BASE_URL}/auth/refresh`, {
            refreshToken: store.getState().auth.refreshToken,
          })
          .then(({ data }) => {
            const accessToken = data.data.accessToken;
            store.dispatch(setAccessToken(accessToken));
            processQueue(null, accessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
