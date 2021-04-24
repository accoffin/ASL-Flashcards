const router = require("express").Router();
const Flashcard = require("../models/Flashcard.model");

/* GET home page */
router.get("/flashcards", (req, res, next) => {
  Flashcard.find({})
    .then((flashcards) => {
      res.render("flashcard/index", flashcards);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/flashcard/new", (req, res, next) => {
  res.render("flashcard/new");
});

router.post("/flashcard/new", (req, res, next) => {
  const { name, gifURL, category } = req.body;
  Flashcard.create({
    name,
    gifURL,
    category,
  })
    .then((flashcard) => {
      console.log(`created flashcard for: ${flashcard.name}`);
      res.redirect("/flashcards");
    })
    .catch((error) => {
      console.log(error);
      res.render("flashcard/new", { errorMessage: error });
    });
});

router.get("/flashcard/:id", (req, res, next) => {
  Flashcard.findById(req.params.id)
    .then((flashcard) => {
      console.log(`showing flashcard for: ${flashcard.name}`);
      res.render("flashcard/detail.hbs", flashcard);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/flashcard/:id/edit", (req, res, next) => {
  Flashcard.findById(req.params.id)
    .then((flashcard) => {
      console.log(`editing flashcard for: ${flashcard.name}`);
      res.render("flashcard/edit.hbs", { flashcard: flashcard });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/flashcard/:id", (req, res, next) => {
  const { name, gifURL, category } = req.body;
  Flashcard.findByIdAndUpdate(req.params.id, {
    name,
    gifURL,
    category,
  })
    .then((flashcard) => {
      console.log(`updated flashcard for: ${flashcard.name}`);
      res.redirect("/flashcards");
    })
    .catch((error) => {
      console.log(error);
      res.render("flashcard/edit", {
        flashcard: flashcard,
        errorMessage: error,
      });
    });
});

router.post("/flashcard/:id/delete", (req, res, next) => {
  Flashcard.findByIdAndRemove(req.params.id)
    .then((flashcard) => {
      console.log(`Deleted flashcard for: ${flashcard.name}`);
      res.redirect("/flashcards");
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

module.exports = router;
