const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const flashCardSchema = new Schema({
  gloss: { type: String, required: true },
  gif: { type: String, required: [true, "No URL for gif"] },
});

const Flashcard = model("Flashcard", flashCardSchema);

module.exports = Flashcard;
