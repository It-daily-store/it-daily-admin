import axios from "axios";
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

axiosInstance.interceptors.request.use(async (config) => {
  if (isClient) {
    if (!config.headers["Authorization"]) {
      const token = getAccessToken();
      if (token) {
        const data = jwtDecode(token);
        const isExpired = dayjs().isAfter(dayjs.unix(data?.exp as number));
        if (isExpired) {
          try {
            // Wait for the token refresh response
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/auth/refresh-token`,
              {},
              { withCredentials: true },
            );
            const newAccessToken = response.data.data.accessToken as string;
            store.dispatch(updateAuthData({ token: newAccessToken }));
            config.headers["Authorization"] = `${newAccessToken}`;
          } catch (err) {
            console.log("Error refreshing token:", err);
            toast.error("Your session has expired. Please log in again.");
            store.dispatch(resetAuthData());
            clearCookie();
            return Promise.reject(err); // Optional: reject if token refresh fails
          }
        } else {
          config.headers["Authorization"] = `${token}`;
        }
      }
    }
  }
  return config;
});

export default axiosInstance;
