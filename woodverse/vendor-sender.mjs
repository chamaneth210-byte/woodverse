import { io } from "socket.io-client";

const token = process.env.VENDOR_TOKEN;

const socket = io("http://localhost:4000", {
  auth: { token },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Vendor connected:", socket.id);

  socket.emit("vendor:message:send", {
    room: "supplier-vendor-messages",
    supplier: "Lumbini Timber Co.",
    vendor: "Kasun Fernando Woodcraft",
    text: "Hello Supplier, I need 10 teak wood boards. Please send me your price.",
  });

  console.log("📨 Vendor message sent");
});

socket.on("vendor:message", (message) => {
  console.log("\n📩 VENDOR RESPONSE:");
  console.log(JSON.stringify(message, null, 2));
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 5000);
