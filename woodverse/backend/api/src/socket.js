import { currentTime } from "./utils/helpers.js";
import { verifyToken } from "./utils/auth.js";

export function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication required."));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid token."));
    }
    socket.user = decoded;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("vendor:join", ({ room = "supplier-vendor-messages", supplier } = {}) => {
      socket.join(room);
      socket.emit("vendor:message", {
        id: `welcome-${Date.now()}`,
        vendor: "Lanka Teak Estates",
        sender: "vendor",
        text: `${supplier || "Supplier"} is connected to vendor messaging.`,
        time: currentTime(),
      });
    });

    socket.on("vendor:thread:open", ({ vendor }) => {
      socket.emit("vendor:message", {
        id: `thread-${Date.now()}`,
        vendor,
        sender: "vendor",
        text: `Realtime thread opened with ${vendor}.`,
        time: currentTime(),
      });
    });

    socket.on("vendor:message:send", ({ room = "supplier-vendor-messages", supplier, vendor, text }) => {
      const sentMessage = {
        id: `socket-${Date.now()}`,
        vendor,
        sender: "supplier",
        text,
        time: currentTime(),
      };
      socket.to(room).emit("vendor:message", sentMessage);

      socket.emit("vendor:message", {
        id: `ack-${Date.now()}`,
        vendor,
        sender: "vendor",
        text: `${vendor} received your message from ${supplier || "supplier"}.`,
        time: currentTime(),
      });
    });

    socket.on("notification:join", ({ room = "woodverse-notifications", actor = "vendor" } = {}) => {
      socket.join(room);
      socket.emit("notification:event", {
        id: `notice-welcome-${Date.now()}`,
        audience: "System",
        source: "WoodVerse API",
        title: "Notification channel connected",
        message: `${actor} is receiving supplier and customer updates in real time.`,
        time: currentTime(),
      });
    });

    socket.on("notification:send", ({ room = "woodverse-notifications", audience = "Vendor", source = "WoodVerse", title, message }) => {
      if (!socket.user || socket.user.role !== "admin") {
        return socket.emit("notification:event", {
          id: `notice-error-${Date.now()}`,
          audience: "System",
          source: "WoodVerse API",
          title: "Unauthorized",
          message: "Only admins can send notifications.",
          time: currentTime(),
        });
      }
      const notification = {
        id: `notice-${Date.now()}`,
        audience,
        source,
        title: title || `${audience} notification`,
        message: message || "A new WoodVerse notification was created.",
        time: currentTime(),
      };
      io.to(room).emit("notification:event", notification);
    });
  });
}
