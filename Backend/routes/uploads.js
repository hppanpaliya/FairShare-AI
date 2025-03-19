const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const Item = require("../models/Item");
const { broadcastEventUpdate } = require("../config/socket");
const { parseBillImage } = require("../utils/openaiParser");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { eventId } = req.params;
    const eventDir = path.join(uploadsDir, eventId);

    // Create event-specific directory if it doesn't exist
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
    }

    cb(null, eventDir);
  },
  filename: async function (req, file, cb) {
    const { eventId } = req.params;

    try {
      // Get event details to use event name in filename
      const event = await Event.findOne({ eventId });
      if (!event) {
        return cb(new Error("Event not found"));
      }

      // Create a safe filename using event name and original extension
      const fileExt = path.extname(file.originalname);
      const safeEventName = event.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filename = `${safeEventName}${fileExt}`;

      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  },
});

// Upload bill image
router.post("/:eventId/bill", upload.single("billImage"), async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update event with the file path
    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Save relative path to the image
    const relativePath = path.join(eventId, req.file.filename);
    event.billImage = relativePath;
    // Reset billParsed flag to false when a new image is uploaded
    event.billParsed = false;
    await event.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json({
      message: "Bill image uploaded successfully",
      billImage: relativePath,
    });
  } catch (error) {
    console.error("Error uploading bill image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Parse bill image and add items
router.post("/:eventId/parse-bill", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the event
    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if bill image exists
    if (!event.billImage) {
      return res.status(400).json({ message: "No bill image found for this event" });
    }

    // Get the full path of the image
    const imagePath = path.join(uploadsDir, event.billImage);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Bill image file not found" });
    }

    // Parse the bill image with OpenAI
    const extractedItems = await parseBillImage(imagePath);

    // Create items in the database
    const createdItems = [];
    for (const item of extractedItems) {
      const newItem = new Item({
        eventId,
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice || item.unitPrice * (item.quantity || 1),
        claims: [],
      });

      await newItem.save();
      createdItems.push(newItem);
    }

    // Set billParsed flag to true if items were extracted
    if (createdItems.length > 0) {
      event.billParsed = true;
      await event.save();
    }

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json({
      message: "Bill parsed successfully",
      itemsExtracted: createdItems.length,
      items: createdItems,
      billParsed: event.billParsed,
    });
  } catch (error) {
    console.error("Error parsing bill:", error);
    res.status(500).json({ message: "Error parsing bill", error: error.message });
  }
});

// Get bill image
router.get("/:eventId/bill", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.billImage) {
      return res.status(404).json({ message: "No bill image found for this event" });
    }

    const imagePath = path.join(uploadsDir, event.billImage);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      event.billImage = null;
      event.billParsed = false;
      await event.save();
      return res.status(404).json({ message: "Bill image file not found" });
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error retrieving bill image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete bill image
router.delete("/:eventId/bill", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.billImage) {
      return res.status(404).json({ message: "No bill image found for this event" });
    }

    const imagePath = path.join(uploadsDir, event.billImage);

    // Delete file if exists
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update event record - reset both billImage and billParsed flags
    event.billImage = null;
    event.billParsed = false;
    await event.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json({ message: "Bill image deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
