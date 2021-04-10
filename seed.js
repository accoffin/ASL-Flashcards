require("dotenv").config();
const Flashcard = require("./models/Flashcard.model");
const mongoose = require("mongoose");

const flashcards = [];

async function seedTheDB() {
  await require("./config/mongoose.config");
  Flashcard.create(flashcards)
    .then((responseFromDB) => {
      console.log(`${responseFromDB.length} entries have been added.`);
      mongoose.connection.close();
    })
    .catch((err) => console.log("err", err));
}
seedTheDB();
