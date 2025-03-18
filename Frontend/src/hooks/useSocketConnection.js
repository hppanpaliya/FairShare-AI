import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../services/api";

const useSocketConnection = (eventId, onEventUpdated) => {
  const [connected, setConnected] = useState(false);
  const [usersOnline, setUsersOnline] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect when we have an eventId
    if (!eventId) {
      setConnected(false);
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    // Setup event listeners
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);

      // Join the event room
      socketRef.current.emit("join-event", eventId);
    });

    socketRef.current.on("users-count", (count) => {
      setUsersOnline(count);
    });

    socketRef.current.on("event-updated", (data) => {
      console.log("Received event update", data);
      if (onEventUpdated) {
        onEventUpdated(data);
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setConnected(false);
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Clean up on component unmount or when eventId changes
    return () => {
      if (socketRef.current) {
        if (eventId) {
          socketRef.current.emit("leave-event", eventId);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [eventId, onEventUpdated]);

  return { connected, usersOnline };
};

export default useSocketConnection;
