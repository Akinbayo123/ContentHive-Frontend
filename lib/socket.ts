import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

export const socket = io(API_BASE_URL || "http://localhost:5000", {
  autoConnect: false
});
