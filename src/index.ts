import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io"; // Corrected import
import { handleSignaling } from "./signaling";

const app = express();

// Enable CORS for all origins (adjust as needed)
const corsOptions = {
  origin: "*", // Replace with your frontend URL
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

// SSL Certificates (adjust path as needed)
const server = https.createServer(
  {
    key: fs.readFileSync(
      path.resolve(__dirname, "../../ssl_certs/private.key")
    ), // Adjust path if certs are elsewhere
    cert: fs.readFileSync(
      path.resolve(__dirname, "../../ssl_certs/certificate.crt")
    ),
  },
  app
);

// Corrected: Use the Server constructor from socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Same as frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("WebRTC Server Running");
});

// Handle WebRTC signaling events (imported from signaling.ts)
handleSignaling(io);

const PORT = 443;
server.listen(PORT, () => {
  console.log(`Server is running on https://0.0.0.0:${PORT}`);
});
