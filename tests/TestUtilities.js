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
  },
  DECK: {
    CARDS: "cards"
  }
};

const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes


const createCard = (card) => {
  const idCollection = [];
  return idCollection;
};

const createDeck = async (deck, options) => {
  const idCollection = [];
  if (options[OPTIONS.DECK.CARDS]) {
    const cards = options[OPTIONS.DECK.CARDS];
    const cardIds = [];
    for (const card of cards) {
      await Flashcard.create(card).then(card => {
        idCollection.push({type: MODELS.CARD, id: card._id});
        cardIds.push(card._id);
      })
      .catch((error) => {
        console.log("Warning: unable to create test card", error);
      });
    }
    deck.cards = cardIds;
  }
  await Deck.create(deck).then((deck) => {
    idCollection.push({type: MODELS.DECK, id: deck._id});
  })
  .catch(() => {
    console.log("Warning: unable to create test deck");
  });
  return idCollection;
};

const createUser = async (user, options) => {
  const idCollection = [];

  if (options[OPTIONS.USER.DECKS]) {
    const decks = options[OPTIONS.USER.DECKS];
    const deckIds = [];
    for (const deck of decks) {
      const {name, color, cards} = deck;
      const deckDocuments = await createDeck(
        {name, color},
        { [OPTIONS.DECK.CARDS]: cards }        
      );
      const deckItself = deckDocuments[deckDocuments.length - 1];
      if (deckItself?.type === MODELS.DECK) deckIds.push(deckItself.id);
      idCollection.push(...deckDocuments);
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
};

const getUser = async (id) => {
  return await User.findById(id).exec();
};

module.exports = {
  getUser: getUser,
  mockCard: createCard,
  mockDeck: createDeck,
  mockUser: createUser,
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
