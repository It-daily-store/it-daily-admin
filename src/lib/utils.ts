import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";
import { TGenericErrorResponse } from "@/interface/error.interface";
import { toast } from "sonner";
import { store } from "@/redux/store";
import { resetAuthData } from "@/redux/reducers/auth/authSlice";
import { clearCookie } from "@/actions/logout";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const verifyToken = (token: string) => {
  const decoded = jwtDecode(token);
  return decoded;
};

export const globalError = (error: unknown) => {
  const typeError = error as { data: TGenericErrorResponse };

  if (typeError?.data?.errorSources?.length > 0) {
    toast.error(typeError.data?.errorSources[0]?.message);
  } else {
    toast.error("An unknown error occurred");
  }
};

export const getAccessToken = () => {
  const { token } = store.getState().auth;
  if (token) {
    return token;
  } else {
    return null;
  }
};

export const handleLogout = () => {
  store.dispatch(resetAuthData());
  clearCookie();
};

export function isValidUrl(url: string): boolean {
  try {
    // Validate URL format
    new URL(url);

    return true;
  } catch {
    // Invalid URL format
    return false;
  }
}
