const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { broadcastEventUpdate } = require("../config/socket");

// Delete an item
router.delete("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const eventId = item.eventId;

    // Delete the item
    await Item.findByIdAndDelete(itemId);

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, eventId);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update an item
router.put("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, quantity, unitPrice, totalPrice } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // Update item fields
    item.name = name;
    item.quantity = quantity;
    item.unitPrice = unitPrice;
    item.totalPrice = totalPrice;
    
    await item.save();
    
    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, item.eventId);
    
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update item claims
router.put("/:itemId/claims", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { personId, quantity } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Find if this person already has a claim
    const existingClaimIndex = item.claims.findIndex((claim) => claim.personId.toString() === personId);

    // Convert quantity to a number (now supports decimals)
    const claimQuantity = parseFloat(quantity) || 0;

    if (existingClaimIndex >= 0) {
      // If quantity is 0, remove the claim
      if (claimQuantity === 0) {
        item.claims = item.claims.filter((claim) => claim.personId.toString() !== personId);
      } else {
        // Otherwise update the quantity
        item.claims[existingClaimIndex].quantity = claimQuantity;
      }
    } else if (claimQuantity > 0) {
      // Add new claim
      item.claims.push({ personId, quantity: claimQuantity });
    }

    await item.save();

    // Broadcast update to all connected clients
    const io = req.app.get("io");
    await broadcastEventUpdate(io, item.eventId);

    res.json(item);
  } catch (error) {
    console.error("Error updating claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
