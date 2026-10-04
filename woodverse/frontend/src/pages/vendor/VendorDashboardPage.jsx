useEffect(() => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "/";

  console.log("Socket URL:", socketUrl);

  const token = localStorage.getItem("woodverse-auth-token");

  console.log("Socket token exists:", !!token);

  const socket = io(socketUrl, {
    auth: {
      token,
    },
    autoConnect: true,
    reconnectionAttempts: 3,
    transports: ["websocket", "polling"],
  });

  const handleConnect = () => {
    console.log("Socket connected:", socket.id);

    setNotificationStatus("Connected");

    socket.emit("notification:join", {
      room: "woodverse-notifications",
      actor: "Vendor Dashboard",
    });

    console.log("Joined notification room: woodverse-notifications");
  };

  const handleDisconnect = (reason) => {
    console.log("Socket disconnected:", reason);
    setNotificationStatus("Offline");
  };

  const handleConnectError = (error) => {
    console.error("Socket connection error:", error.message);
    console.error("Socket URL:", socketUrl);
    console.error("Token exists:", !!token);

    setNotificationStatus("Offline");
  };

  const handleNotification = (incoming) => {
    console.log("Notification received:", incoming);

    setNotifications((items) => {
      if (items.some((item) => item.id === incoming.id)) {
        return items;
      }

      return [
        {
          ...incoming,
          time: incoming.time || "Just now",
        },
        ...items,
      ];
    });
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);
  socket.on("notification:event", handleNotification);

  setNotificationSocket(socket);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.off("notification:event", handleNotification);

    socket.disconnect();
  };
}, []);
