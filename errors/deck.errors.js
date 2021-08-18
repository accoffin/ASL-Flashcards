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
    DECK_NOT_FOUND: { errorMessage: "Deck update failed. Id provided does not exist." }
  },
  DELETE: {
    DECK_NOT_FOUND: {
      errorMessage: "Deck deletion failed. Id provided does not exist.",
    },
  },
};
