const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const Session = require("../models/Session.model");
const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

const User = require("../models/User.model");
const Deck = require("../models/Deck.model");
const Flashcard = require("../models/Flashcard.model");

const ERRORS = require("../errors/auth.errors");

router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  if (!email) {
    return res.status(400).json(ERRORS.SIGNUP.MISSING_EMAIL);
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!password || !regex.test(password)) {
    return res.status(400).json(ERRORS.SIGNUP.INVALID_PASSWORD);
  }
  User.findOne({ email }).then((found) => {
    if (found) {
      return res.status(400).json(ERRORS.SIGNUP.ALREADY_REGISTERED);
    } else
      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) =>
          Deck.create({ name: "First Deck!" }).then((deck) => {
            return { deck, hashedPassword };
          })
        )
        .then((deckAndHash) => {
          const { deck, hashedPassword } = deckAndHash;
          return User.create({
            email,
            passhash: hashedPassword,
            isAdmin,
            decks: [deck._id],
            currentDeck: deck._id,
          }).then((user) => {
            return { deck, user };
          });
        })
        .then((deckAndUser) => {
          // console.log("User created:", user);
          const { deck, user } = deckAndUser;
          deck.cards = [];
          user.currentDeck = deck;
          user.decks[0] = deck;
          login(res, user);
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ errorMessage: error.message });
          } else if (error.code === 11000) {
            return res.status(400).json({ errorMessage: error.message });
          } else return res.status(500).json({ errorMessage: error.message });
        });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json(ERRORS.LOGIN.MISSING_EMAIL);
  } else {
    User.findOne({ email })
      .populate({
        path: "currentDeck",
        populate: {
          path: "cards",
          select: "gloss gif",
        },
      })
      .populate("decks")
      .then((user) => {
        if (!user) {
          return res.status(400).json(ERRORS.LOGIN.EMAIL_NOT_FOUND);
        }

        bcrypt.compare(password, user.passhash).then((isSamePassword) => {
          if (!isSamePassword) {
            return res.status(400).json(ERRORS.LOGIN.INCORRECT_PASSWORD);
          } else {
            const userData = JSON.parse(JSON.stringify(user));
            const cardsGlossGifOnly = userData.currentDeck.cards.map((card) => {
              const { gloss, gif } = card;
              return { gloss, gif };
            });
            userData.currentDeck.cards = cardsGlossGifOnly;

            login(res, userData);
          }
        });
      });
  }
});

router.post("/logout", (req, res) => {
  if (!req.headers?.authorization) {
    return res.status(403).json(ERRORS.LOGOUT.NOT_LOGGED_IN);
  } else
    Session.findByIdAndDelete(req.headers.authorization)
      .then((_) => {
        return res
          .status(200)
          .json({ message: "You have successfully logged out" });
      })
      .catch((error) =>
        res.status(500).json({ errorMessage: "Logout failed.", error: error })
      );
});

function login(res, user) {
  Session.findOne({ user: user._id }).then((session) => {
    if (!session) {
      Session.create({
        user: user._id,
        expires: Date.now() + SESSION_EXPIRATION,
      })
        .then((newSession) => {
          return res.status(201).json({ session: newSession, user: user });
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json({ errorMessage: "Login failed", error: error });
        });
    } else {
      session.expires = Date.now() + SESSION_EXPIRATION;
      session
        .save()
        .then(() => res.status(200).json({ session: session, user: user }))
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json({ errorMessage: "Login failed", error: error });
        });
    }
  });
}

module.exports = router;
