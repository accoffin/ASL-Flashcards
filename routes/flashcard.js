const router = require("express").Router();
const Flashcard = require("../models/Flashcard.model");

/* GET home page */
router.get("/", (req, res, next) => {
  Flashcard.find({})
    .then((flashcards) => {
      res.render("flashcard/index", flashcards);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/new", (req, res, next) => {
  res.render("flashcard/new");
});

router.post("/new", (req, res, next) => {
  const { name, gifURL, dummyAnswers } = req.body;
  Flashcard.create({
    name,
    gifURL,
    dummyAnswers,
  })
    .then((flashcard) => {
      console.log(`created flashcard for: ${flashcard.name}`);
      res.redirect("/new");
    })
    .catch((error) => {
      console.log(error);
      res.render("flashcard/new", { errorMessage: error });
    });
});

module.exports = router;
