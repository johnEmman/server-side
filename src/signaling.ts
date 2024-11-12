import { Server } from "socket.io";

export const handleSignaling = (io: Server) => {
  let connectedUsers: string[] = []; // Track connected users

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Add the new user to the list
    connectedUsers.push(socket.id);

    // Emit the updated user list along with the current user ID to all clients
    io.emit("userList", connectedUsers, socket.id);

    // Notify all clients about the new user
    io.emit("user-connected", socket.id);

    // Handle incoming messages and broadcast them to the target user
    socket.on(
      "sendMessage",
      (
        messageData: { senderId: string; message: string },
        targetId: string
      ) => {
        console.log(
          `Message sent from ${messageData.senderId} to ${targetId}: ${messageData.message}`
        );
        // Emit the message to the target user
        io.to(targetId).emit("message", messageData);
      }
    );

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
      io.emit("offer", data);
    });

    socket.on("answer", (data) => {
      io.emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      io.emit("ice-candidate", data);
    });
  });
};
