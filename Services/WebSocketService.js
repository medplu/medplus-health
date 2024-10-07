import io from "socket.io-client";
import { Platform } from "react-native";

export const backendBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:1337" : "http://localhost:1337";

export const WebSocketService = (token) => {
  const socket = io(backendBaseUrl, {
    auth: {
      token: token,
    },
  });
  return socket;
};