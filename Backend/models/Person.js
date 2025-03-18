const mongoose = require("mongoose");

const PersonSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model("Person", PersonSchema);
