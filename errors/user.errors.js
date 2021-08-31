module.exports = {
  AUTH: {
    UNAUTHORIZED: { errorMessage: "You are not authorized. Log in required." },
  },
  UPDATE: {
    INVALID_USERID: { errorMessage: "The id of the user pending update is invalid." },
    INVALID_MODE: { errorMessage: "New mode must be expressive or receptive." },
    INVALID_CURRENT_DECK: { errorMessage: "New current deck must be in user's deck list." },
  }
};