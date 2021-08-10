const User = require("../models/User.model");
const Session = require("../models/Session.model");
const Deck = require("../models/Deck.model");
const Flashcard = require("../models/Flashcard.model");

const MODELS = {
  SESSION: "session",
  USER: "user",
  DECK: "deck",
  CARD: "card",
};

module.exports = {

  OPTIONS: {
    USER: {
      LOGGED_IN: true,

    }

  }

  mockUser: (user, options) => {
    const idCollection = [];
    
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
