import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";
import { TGenericErrorResponse } from "@/interface/error.interface";
import { toast } from "sonner";
import { store } from "@/redux/store";
import { resetAuthData } from "@/redux/reducers/auth/authSlice";
import { clearCookie } from "@/actions/logout";
import localforage from "localforage";

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

const clearPersistedAuth = async () => {
  try {
    const instance = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: "gadget_grid_admin",
    });
    await instance.removeItem("persist:auth");
  } catch (error) {
    console.log(error);
  }
  try {
    localStorage.removeItem("persist:auth");
  } catch (error) {
    console.log(error);
  }
};

export const handleLogout = async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.log("Error calling logout endpoint:", error);
  } finally {
    store.dispatch(resetAuthData());
    await clearCookie();
    await clearPersistedAuth();
  }
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
