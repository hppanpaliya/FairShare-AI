const express = require("express");
const router = express.Router();
const Person = require("../models/Person");
const Item = require("../models/Item");
const { broadcastEventUpdate } = require("../config/socket");

// Delete a person
router.delete("/:personId", async (req, res) => {
  try {
    const { personId } = req.params;

    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    const eventId = person.eventId;

    // Remove this person's claims from all items
    await Item.updateMany({ eventId }, { $pull: { claims: { personId } } });

    // Delete the person
    await Person.findByIdAndDelete(personId);

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json({ message: "Person deleted successfully" });
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
