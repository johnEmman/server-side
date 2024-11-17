import { Server, Socket } from "socket.io";

export const handleSignaling = (io: Server) => {
  const users = new Map<string, string>(); // socketId -> username

  let connectedUsers: string[] = [];

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Handle username registration
    socket.on("register", (username: string) => {
      users.set(socket.id, username);
      io.emit("users", Array.from(users.entries())); // Send updated user list
      console.log(username, socket.id);
      connectedUsers.push(username);
      io.emit("userList", connectedUsers);
      console.log(connectedUsers);
    });
    // Handle WebRTC offer
    socket.on("offer", (data: { to: string; offer: any }) => {
      socket.to(data.to).emit("offer", {
        from: socket.id,
        offer: data.offer,
      });
    });

    // Handle WebRTC answer
    socket.on("answer", (data: { to: string; answer: any }) => {
      socket.to(data.to).emit("answer", {
        from: socket.id,
        answer: data.answer,
      });
    });

    // Handle ICE candidates
    socket.on("ice-candidate", (data: { to: string; candidate: any }) => {
      socket.to(data.to).emit("ice-candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      users.delete(socket.id);
      io.emit("users", Array.from(users.entries())); // Send updated user list
      console.log("User disconnected:", socket.id);
    });
  });
};
