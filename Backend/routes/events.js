const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Event = require("../models/Event");
const Item = require("../models/Item");
const Person = require("../models/Person");
const { broadcastEventUpdate } = require("../config/socket");

// Create a new event
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const eventId = uuidv4();

    const newEvent = new Event({
      eventId,
      name,
      taxSplitEqually: true, // Default values
      tipSplitEqually: true,
    });

    await newEvent.save();
    res.status(201).json({ eventId, name });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get event by ID
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const items = await Item.find({ eventId });
    const people = await Person.find({ eventId });

    res.json({
      event,
      items,
      people,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update event (tax, tip and split settings)
router.put("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { tax, tip, taxSplitEqually, tipSplitEqually } = req.body;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update fields if they are provided
    if (tax !== undefined) event.tax = tax;
    if (tip !== undefined) event.tip = tip;
    if (taxSplitEqually !== undefined) event.taxSplitEqually = taxSplitEqually;
    if (tipSplitEqually !== undefined) event.tipSplitEqually = tipSplitEqually;

    await event.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new person to an event
router.post("/:eventId/people", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name } = req.body;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const newPerson = new Person({
      eventId,
      name,
    });

    await newPerson.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.status(201).json(newPerson);
  } catch (error) {
    console.error("Error adding person:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new item to an event
router.post("/:eventId/items", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, quantity, unitPrice, totalPrice } = req.body;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const newItem = new Item({
      eventId,
      name,
      quantity,
      unitPrice,
      totalPrice,
      claims: [],
    });

    await newItem.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
