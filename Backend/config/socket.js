const { Server } = require("socket.io");
const Event = require("../models/Event");
const Item = require("../models/Item");
const Person = require("../models/Person");

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join an event room
    socket.on("join-event", (eventId) => {
      socket.join(eventId);
      console.log(`User ${socket.id} joined event ${eventId}`);
    });

    // Leave an event room
    socket.on("leave-event", (eventId) => {
      socket.leave(eventId);
      console.log(`User ${socket.id} left event ${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

// Helper function to broadcast event updates
const broadcastEventUpdate = async (io, eventId) => {
  try {
    const event = await Event.findOne({ eventId });
    const items = await Item.find({ eventId });
    const people = await Person.find({ eventId });

    io.to(eventId).emit("event-updated", { event, items, people });
  } catch (error) {
    console.error("Error broadcasting event update:", error);
  }
};

module.exports = { configureSocket, broadcastEventUpdate };
