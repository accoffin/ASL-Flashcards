const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const flashcardSchema = new Schema({
  name: String,
  wordSide: {
    word: String,
  },
  gifSide: {
    url: String, //url to gif src here.
  },
});

const Flashcard = model("Flashcard", flashcardSchema);

module.exports = Flashcard;
