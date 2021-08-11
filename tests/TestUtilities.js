const User = require("../models/User.model");
const Session = require("../models/Session.model");
const Deck = require("../models/Deck.model");
const Flashcard = require("../models/Flashcard.model");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const MODELS = {
  SESSION: "session",
  USER: "user",
  DECK: "deck",
  CARD: "card",
};

const OPTIONS = {
  USER: {
    LOGGED_IN: "loggedIn",
    DECKS: "decks",
  }
};

const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

module.exports = {


  mockCard: (card) => {
    const idCollection = [];
    return idCollection;
  },

  mockDeck: (deck) => {
    const idCollection = [];
    return idCollection;
  },

  mockUser: async (user, options) => {
    const idCollection = [];

    if (options[OPTIONS.USER.DECKS]) {
      const decks = options[OPTIONS.USER.DECKS];
      const deckIds = [];
      for (const deck of decks) {
        const cardIds = [];
        for (const card of deck.cards) {
          await Flashcard.create(card).then(card => {
            idCollection.push({type: MODELS.CARD, id: card._id});
            cardIds.push(card._id);
          })
          .catch(() => {
            console.log("Warning: unable to create test card");
          });
        }
        deck.cards = cardIds;
        await Deck.create(deck).then((deck) => {
          idCollection.push({type: MODELS.DECK, id: deck._id});
          deckIds.push(deck._id);
        })
        .catch(() => {
          console.log("Warning: unable to create test deck");
        });
      }
      user.decks = deckIds;
      user.currentDeck = deckIds[0];
    }
    user.passhash = await bcrypt.genSalt(saltRounds).then((salt) => bcrypt.hash(user.password, salt));
    delete user.password;
    const newUser = await User.create(user)
    .then(user => {
      idCollection.push({type: MODELS.USER, id: user._id});
      return user;
    })
    .catch(() => {
      console.log("Warning: unable to create test user");
    });
    if (options[OPTIONS.USER.LOGGED_IN]) {
      await Session.create({
        user: newUser?._id, 
        expires: Date.now() + SESSION_EXPIRATION
      })
      .then(session => {
        idCollection.push({type: MODELS.SESSION, id: session._id});
      })
      .catch(() => {
        console.log("Warning: unable to create test session");
      });
    }
    return idCollection;
  },

  tearDown: (idCollection) => {
    const documentDeletions = [];
    for (const document of idCollection) {
      const { type, id } = document;
      let deletionPromise;
      switch (type) {
        case MODELS.SESSION:
          deletionPromise = Session.findByIdAndDelete(id).exec();
          break;
        case MODELS.USER:
          deletionPromise = User.findByIdAndDelete(id).exec();
          break;
        case MODELS.DECK:
          deletionPromise = Deck.findByIdAndDelete(id).exec();
          break;
        case MODELS.CARD:
          deletionPromise = Flashcard.findByIdAndDelete(id).exec();
          break;
        default:
          break;
      }
      if (deletionPromise) documentDeletions.push(deletionPromise);
    }
    return Promise.all(documentDeletions).catch(() => {
      console.log("Warning: teardown failed");
    });
  },
};
