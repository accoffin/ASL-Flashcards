module.exports = {
  AUTH: {
    UNAUTHORIZED: { errorMessage: "You are not authorized. Log in required." },
  },
  CREATE: {
    MISSING_NAME: { errorMessage: "Please provide a name for this deck." },
  },
  GET: {
    DECK_NOT_FOUND: { errorMessage: "Deck not found." },
  },
  UPDATE: {
    DECK_NOT_FOUND: { errorMessage: "Deck Id does not exist." },
    REMOVE_ABSENT_CARD: { errorMessage: "Remoce card failed. Card does not exist within deck." },
    ADD_DUPLICATE_CARD: { errorMessage: "Add card failed. Card is already in deck." },
    ADD_NONEXISTENT_CARD: { errorMessage: "Add card failed. Card does not exist within database." }
  },
  DELETE: {
    DECK_NOT_FOUND: {
      errorMessage: "Deck deletion failed. Id provided does not exist.",
    },
  },
};
