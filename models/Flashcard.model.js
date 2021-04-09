const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const flashCardSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
  gifURL: {
    type: String,
    required: [true, "No URL for gif"],
  },
  dummy: {
    type: [String],
  },
});

const Flashcard = model("Flashcard", flashCardSchema);

module.exports = Flashcard;
