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

const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

const createDeck = async (deck, { cards }) => {
  const idCollection = [];
  if (cards) {
    const cardIds = [];
    for (const card of cards) {
      await Flashcard.create(card)
        .then((card) => {
          idCollection.push({ type: MODELS.CARD, id: card._id });
          cardIds.push(card._id);
        })
        .catch((error) => {
          console.log("Warning: unable to create test card", error);
        });
    }
    deck.cards = cardIds;
  }
  await Deck.create(deck)
    .then((deck) => {
      idCollection.push({ type: MODELS.DECK, id: deck._id });
    })
    .catch(() => {
      console.log("Warning: unable to create test deck");
    });
  return idCollection;
};

const createUser = async (user, { loggedIn, decks }) => {
  const idCollection = [];

  if (decks) {
    const deckIds = [];
    for (const deck of decks) {
      const { name, color, cards } = deck;
      const deckDocuments = await createDeck({ name, color }, { cards });
      const deckDoc = deckDocuments[deckDocuments.length - 1];
      if (deckDoc?.type === MODELS.DECK) deckIds.push(deckDoc.id);
      idCollection.push(...deckDocuments);
    }
    user.decks = deckIds;
    user.currentDeck = deckIds[0];
  }
  user.passhash = await bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(user.password, salt));
  delete user.password;
  const newUser = await User.create(user)
    .then((user) => {
      idCollection.push({ type: MODELS.USER, id: user._id });
      return user;
    })
    .catch(() => {
      console.log("Warning: unable to create test user");
    });
  if (loggedIn) {
    await Session.create({
      user: newUser?._id,
      expires: Date.now() + SESSION_EXPIRATION,
    })
      .then((session) => {
        idCollection.push({ type: MODELS.SESSION, id: session._id });
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

const getSession = async (id) => {
  return await Session.findById(id).exec();
};

const getDeck = async (id) => {
  return await Deck.findById(id).exec();
};

const getCard = async (id) => {
  return await Flashcard.findById(id).exec();
};

const getCards = async () => {
  return await Flashcard.find().exec();
};

const cardSetsEqual = (set1, set2) => {
  if (set1.length !== set2.length) return false;
  for (let i = 0; i < set1.length; i++) {
    if (set1[i].gloss !== set2[i].gloss) return false;
    if (set1[i].gif !== set2[i].gif) return false;
  }
  return true;
};

const tearDown = (idCollection) => {
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
};

module.exports = {
  getCard,
  getCards,
  cardSetsEqual,
  getDeck,
  getUser,
  getSession,
  createDeck,
  mockUser: createUser,
  tearDown,
};
