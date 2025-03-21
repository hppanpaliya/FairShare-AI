const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tax: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  taxSplitEqually: { type: Boolean, default: true },
  tipSplitEqually: { type: Boolean, default: true },
  billImage: { type: String, default: null },
  billParsed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Event", EventSchema);
