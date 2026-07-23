import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TInitialState = {
  isMenuOpen: boolean;
};

const initialState: TInitialState = {
  isMenuOpen: false,
};

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },
  },
});

export const { setMenuOpen } = generalSlice.actions;

export default generalSlice.reducer;
