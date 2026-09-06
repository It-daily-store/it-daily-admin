import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "./utils";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { store } from "@/redux/store";
import { resetAuthData, updateAuthData } from "@/redux/reducers/auth/authSlice";
import { clearCookie } from "@/actions/logout";
import { toast } from "sonner";

const isClient = true;

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  timeout: 120000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_URL}/auth/refresh-token`,
    {},
    { withCredentials: true },
  );
  return response.data.data.accessToken as string;
};

const getNewAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((token) => {
        store.dispatch(updateAuthData({ token }));
        return token;
      })
      .catch((err) => {
        console.log("Error refreshing token:", err);
        toast.error("Your session has expired. Please log in again.");
        store.dispatch(resetAuthData());
        clearCookie();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const isAuthEndpoint = (url?: string) =>
  !!url &&
  (url.includes("/admin-login") ||
    url.includes("/login") ||
    url.includes("/refresh-token") ||
    url.includes("/forgot-password") ||
    url.includes("/verify-otp") ||
    url.includes("/logout"));

type TRetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.request.use(async (config) => {
  if (isClient) {
    if (!config.headers["Authorization"]) {
      const token = getAccessToken();
      if (token) {
        const data = jwtDecode(token);
        const isExpired = dayjs().isAfter(dayjs.unix(data?.exp as number));
        if (isExpired) {
          try {
            const newAccessToken = await getNewAccessToken();
            config.headers["Authorization"] = `${newAccessToken}`;
          } catch (err) {
            return Promise.reject(err);
          }
        } else {
          config.headers["Authorization"] = `${token}`;
        }
      }
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as TRetryConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await getNewAccessToken();
        originalRequest.headers["Authorization"] = `${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
