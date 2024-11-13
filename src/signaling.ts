import { Server } from "socket.io";

export const handleSignaling = (io: Server) => {
  let connectedUsers: string[] = []; // Track connected users
  const users: any = {};
  io.on("connection", (socket) => {
    let userId = socket.handshake.query.userId;
    if (!userId) {
      userId = `user-${Date.now()}`; // Generate a simple unique user ID
    }
    users[socket.id] = userId;
    console.log("A user connected:", socket.id);

    // Add the new user to the list
    connectedUsers.push(socket.id);

    // Emit the updated user list along with the current user ID to all clients
    io.emit("userList", connectedUsers, socket.id);

    // Notify all clients about the new user
    io.emit("user-connected", socket.id);

    // Handle creating a room and joining it
    socket.on("create-room", (roomId: string) => {
      console.log(`Room created with ID: ${roomId}`);

      // Join the room
      socket.join(roomId);

      // Emit the room creation and notify all users in the room
      io.to(roomId).emit("room-created", { roomId, creatorId: socket.id });
      console.log(`${socket.id} joined room ${roomId}`);
    });
    socket.on("join-room", (roomId) => {
      socket.join(roomId); // Join the room
      io.to(roomId).emit("user-joined-room", socket.id); // Notify others in the room
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId); // Leave the room
      io.to(roomId).emit("user-left-room", socket.id); // Notify others in the room
    });

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
