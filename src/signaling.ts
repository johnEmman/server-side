import { Server } from "socket.io";

export const handleSignaling = (io: Server) => {
  let connectedUsers: string[] = []; // Track connected users
  const users: any = {};
  const rooms: Record<string, string[]> = {}; // Store room ID with user list

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    let userId = socket.handshake.query.userId;
    // Add the new user to the list
    connectedUsers.push(socket.id);

    // Emit the updated user list along with the current user ID to all clients
    io.emit("userList", connectedUsers, socket.id);

    // Notify all clients about the new user
    io.emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      // Remove the disconnected user from the list
      connectedUsers = connectedUsers.filter((id) => id !== socket.id);
      // Emit the updated user list to all clients
      io.emit("userList", connectedUsers, socket.id);
      io.emit("user-disconnected", socket.id);
    });

    // Handle WebRTC signaling (offer, answer, ice-candidate)
    socket.on("offer", (data) => {
      socket.to(data.targetId).emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.to(data.targetId).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.targetId).emit("ice-candidate", data);
    });
  });
};
