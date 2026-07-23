// socketManager.js
import { io } from "socket.io-client";

import { Socket } from "socket.io-client";
import { getAccessToken } from "./utils";

export let socket: Socket | null = null;

export const connectSocket = async () => {
  const token = getAccessToken();

  if (!socket) {
    const options = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttemps: 10,
      // rememberUpgrade: false,
      transports: ["websocket"],
      auth: {
        authorization: token || "",
      },
      secure: false,
      rejectUnauthorized: false,
    };
    socket = io(process.env.NEXT_PUBLIC_SK_URL, options);
  }
  console.log({ socket });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
