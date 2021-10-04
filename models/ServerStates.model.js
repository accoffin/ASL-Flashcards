const { Schema, model } = require("mongoose");

const serverSchema = new Schema({
  flashcardSetVersion: { type: Number, required: true, default: 0 },
});

const ServerStates = model("ServerStates", serverSchema);

module.exports = ServerStates;