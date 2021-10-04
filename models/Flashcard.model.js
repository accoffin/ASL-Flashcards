const { Schema, model } = require("mongoose");

const flashCardSchema = new Schema({
  gloss: { type: String, required: true },
  gif: { type: String, required: [true, "No URL for gif"] },
});

const Flashcard = model("Flashcard", flashCardSchema);

module.exports = Flashcard;
