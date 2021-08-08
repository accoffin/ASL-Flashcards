const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const deckSchema = new Schema({
  name: { type: String },
  cards: [{ type: Schema.Types.ObjectId, ref: "Flashcard" }],
});

const Deck = model("Deck", deckSchema);

module.exports = Deck;
