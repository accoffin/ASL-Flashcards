module.exports = {
  SIGNUP: {
    MISSING_USERNAME: { errorMessage: "Please provide your username." },
    ALREADY_REGISTERED: { errorMessage: "Username already taken." },
    INVALID_PASSWORD: {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    },
  },
  LOGIN: {
    MISSING_USERNAME: { errorMessage: "Please provide your username." },
    USER_NOT_FOUND: { errorMessage: "Username not recognized." },
    INCORRECT_PASSWORD: { errorMessage: "Incorrect password." },
  },
  LOGOUT: {
    NOT_LOGGED_IN: { errorMessage: "You are not logged in." },
  },
};
