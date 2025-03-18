const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  claims: [
    {
      personId: { type: String, required: true },
      quantity: { type: Number, required: true }, // Allows decimal values for partial shares
    },
  ],
});

module.exports = mongoose.model("Item", ItemSchema);
