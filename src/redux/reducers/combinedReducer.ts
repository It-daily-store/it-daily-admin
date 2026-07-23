import { combineSlices } from "@reduxjs/toolkit";
import authSlice from "./auth/authSlice";
import generalSlice from "./general/generalReducer";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import localforage from "localforage";
import { baseApi } from "../api/baseApi";
import tableReducer from "./tableCollumn/tableReducer";

let instance;
try {
  instance = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: "gadget_grid_admin",
  });
} catch (error) {
  console.log(error);
}

const authPersistConfig = {
  key: "auth",
  storage: instance || storage,
};

const tablePersistConfig = {
  key: "table",
  storage: instance || storage,
};

const rootReducer = combineSlices({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authSlice),
  general: generalSlice,
  table: persistReducer(tablePersistConfig, tableReducer),
});

export default rootReducer;
