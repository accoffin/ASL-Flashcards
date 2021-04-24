const router = require("express").Router();
const Deck = require("../models/Deck.model");
const Flashcard = require("../models/Flashcard.model");
const User = require("../models/User.model");

const isLoggedIn = require("../middlewares/isLoggedIn");

/* GET home page */
router.get("/decks", isLoggedIn, (req, res, next) => {
  User.findById(req.session.user._id)
    .populate("decks")
    .then((user) => {
      res.render("deck/index", user.decks);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/decks/new", (req, res, next) => {
  const { name, flashcards } = req.body;
  Deck.create({
    name: name,
    flashcards: [],
  })
    .then((deck) => {
      req.session.user.decks.push(deck.id);
      const { username, decks } = req.session.user;
      User.findByIdAndUpdate(req.session.user._id, { username, decks })
        .then((user) => {
          console.log(`created new deck: ${deck.name} for ${user.username}`);
          res.redirect("/decks/" + deck.id);
        })
        .catch((error) => {
          console.log(error);
          next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/decks/:id", isLoggedIn, (req, res, next) => {
  Deck.findById(req.params.id)
    .populate("flashcards")
    .then((deck) => {
      Flashcard.find()
        .then((flashcards) => {
          res.render("deck/detail", { deck, flashcards });
        })
        .catch((error) => {
          console.log(error);
          next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/decks/:deckId/remove/:cardName", (req, res, next) => {
  Deck.findById(req.params.deckId)
    .populate("flashcards")
    .then((deck) => {
      const newCards = deck.flashcards
        .filter((card) => card.name !== req.params.cardName)
        .map((card) => card._id);
      console.log(newCards);
      Deck.findByIdAndUpdate(deck.id, {
        name: deck.name,
        flashcards: newCards,
      })
        .then((deck) => {
          console.log("removed flashcard from deck: " + deck.name);
          res.redirect("/decks/" + deck.id);
        })
        .catch((error) => {
          console.log(error);
          next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/decks/:deckId/add/:cardId", (req, res, next) => {
  Deck.findById(req.params.deckId)
    .then((deck) => {
      deck.flashcards.push(req.params.cardId);
      Deck.findByIdAndUpdate(deck.id, {
        name: deck.name,
        flashcards: deck.flashcards,
      })
        .then((deck) => {
          console.log("added flashcard to deck: " + deck.name);
          res.redirect("/decks/" + deck.id);
        })
        .catch((error) => {
          console.log(error);
          next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/decks/:id/update", (req, res, next) => {
  Deck.findByIdAndUpdate(req.params.id, { name: req.body.name })
    .then((deck) => {
      console.log(`Updated deck name to: ${deck.name}`);
      res.redirect("/decks/" + deck.id);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post("/decks/:id/delete", (req, res, next) => {
  Deck.findByIdAndRemove(req.params.id)
    .then((deck) => {
      console.log(`deleted deck: ${deck.name}`);
      res.redirect("/decks");
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/decks/:id/receptive", (req, res, next) => {
  Deck.findById(req.params.id)
    .populate("flashcards")
    .then((deck) => {
      console.log(`Started receptive training for:`, deck.name);
      res.render("deck/receptive", deck);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.get("/decks/:id/expressive", (req, res, next) => {
  Deck.findById(req.params.id)
    .populate("flashcards")
    .then((deck) => {
      console.log(`Started expressive training for:`, deck.name);
      res.render("deck/expressive", deck);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

module.exports = router;
