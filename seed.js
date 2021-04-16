require("dotenv").config();
const Flashcard = require("./models/Flashcard.model");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// const flashCardSchema = new Schema({
//   name: {
//     type: String,
//     unique: true,
//   },
//   gifURL: {
//     type: String,
//     required: [true, "No URL for gif"],
//   },
//   dummyAnswers: {
//     type: [String],
//   },
// });

const flashcards = [
  {
    name: "Yes",
    gifURL: "https://media.giphy.com/media/1YjsuKnOZzrPKiIzMk/giphy.gif",
  },
  {
    name: "No",
    gifURL: "https://media.giphy.com/media/l4Jz4faxuS1FiSEV2/giphy.gif",
  },
  {
    name: "Maybe",
    gifURL: "https://media.giphy.com/media/l4Jzdw22eZ8QEKCKQ/giphy.gif",
  },
  {
    name: "Hello",
    gifURL: "https://media.giphy.com/media/26FLfptF4bbszv9ss/giphy.gif",
  },
  {
    name: "Goodbye",
    gifURL: "https://media.giphy.com/media/26vIf8bHxBCzNmHhS/giphy.gif",
  },
  {
    name: "Good Morning",
    gifURL: "https://media.giphy.com/media/26FLchGgqamznV64E/giphy.gif",
  },
  {
    name: "Good Evening",
    gifURL: "https://media.giphy.com/media/l4JzdrbDeU2lMMrde/giphy.gif",
  },
  {
    name: "Good Afternoon",
    gifURL: "https://media.giphy.com/media/l4JzaRsX52k8glIFa/giphy.gif",
  },
  {
    name: "Good Night",
    gifURL: "https://media.giphy.com/media/l4Jz5WK4Uddr8KsSc/giphy.gif",
  },
  {
    name: "How are you?",
    gifURL: "https://media.giphy.com/media/3o7TKDw5NA17fKJVWU/giphy.gif",
  },
  {
    name: "Good",
    gifURL: "https://www.lifeprint.com/asl101/gifs/g/good.gif",
  },
  {
    name: "Bad",
    gifURL: "https://www.lifeprint.com/asl101/gifs/b/bad.gif",
  },
  {
    name: "I'm fine.",
    gifURL: "https://media.giphy.com/media/l4Jzd71ci3msO66ac/giphy.gif",
  },
  {
    name: "Please",
    gifURL: "https://media.giphy.com/media/bThpcIRtEww9XCiQOk/giphy.gif",
  },
  {
    name: "Thank you",
    gifURL: "https://media.giphy.com/media/l378fHBtzxp8puj9C/giphy.gif",
  },
];

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
