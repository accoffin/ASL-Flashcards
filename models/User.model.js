const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passhash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, //if 'true' user will have access to flashcard.create page.
  emailConfirmed: { type: Boolean, default: false },
  decks: [{ type: Schema.Types.ObjectId, ref: "Deck" }],
  currentDeck: { type: Schema.Types.ObjectId, ref: "Deck" },
  currentMode: {
    type: String,
    enum: ["expressive", "receptive"],
    default: "receptive",
  },
  cardSetVersion: { type: Number, default: 0 }
});

const User = model("User", userSchema);

module.exports = User;
