import { TPermission, TUser } from "@/interface/auth.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TSetUserData = {
  user: TUser;
  permissions: TPermission[];
};

type TInitialState = {
  isAuthenticated: boolean;
  user: TUser | null;
  permissions: TPermission[];
  isVerified: boolean;
  token: string | null;
  resetSentTime?: string | null;
  verificationSentTime?: string | null;
};

const initialState: TInitialState = {
  isAuthenticated: false,
  user: null,
  permissions: [],
  isVerified: false,
  token: null,
  resetSentTime: null,
  verificationSentTime: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthData: (state, action: PayloadAction<Partial<TInitialState>>) => {
      state.isAuthenticated =
        action.payload?.isAuthenticated ?? state.isAuthenticated;
      state.user = action.payload?.user ?? state.user;
      state.permissions = action.payload?.permissions ?? state.permissions;
      state.isVerified = action.payload?.isVerified ?? state.isVerified;
      state.token = action.payload?.token ?? state.token;
    },
    resetAuthData: () => initialState,
    setUserData: (state, action: PayloadAction<TSetUserData>) => {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
    },
    setResetSentTime: (state, action: PayloadAction<string | null>) => {
      state.resetSentTime = action.payload;
    },

    setVerificationSentTime: (state, action: PayloadAction<string | null>) => {
      state.verificationSentTime = action.payload;
    },
  },
});

export const {
  updateAuthData,
  resetAuthData,
  setUserData,
  setResetSentTime,
  setVerificationSentTime,
} = authSlice.actions;

export default authSlice.reducer;
