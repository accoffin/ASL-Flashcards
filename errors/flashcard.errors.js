module.exports = {
  AUTH: {
    UNAUTHORIZED: { errorMessage: "You are not authorized. Admin log in required." },
  },
  CREATE: {
    MISSING_GLOSS: { errorMessage: "Please provide a gloss for this card." },
    MISSING_GIF: { errorMessage: "Please provide a gif url for this deck." },
  },
  DELETE: {
    CARD_NOT_FOUND: {
      errorMessage: "Nonexistent flashcard cannot be deleted.",
    },
  },
};