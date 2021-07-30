const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {type: String, unique: true},
  passhash: { type: String, required: true},
  isAdmin: { type: Boolean, default: false }, //if 'true' user will have access to flashcard.create page.
  decks: [{ type: Schema.Types.ObjectId, ref: "Deck" }],
  currentDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
  currentMode: {type: String, enum: ["expressive", "receptive"]},
});

const User = model("User", userSchema);

module.exports = User;
