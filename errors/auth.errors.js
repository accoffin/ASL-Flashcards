module.exports = {
  SIGNUP: {
    MISSING_EMAIL: { errorMessage: "Please provide your email address." },
    ALREADY_REGISTERED: { errorMessage: "This email address is already registered." },
    INVALID_PASSWORD: {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    },
  },
  LOGIN: {
    MISSING_EMAIL: { errorMessage: "Please provide your email address." },
    EMAIL_NOT_FOUND: { errorMessage: "Email address not recognized." },
    INCORRECT_PASSWORD: { errorMessage: "Incorrect password." },
  },
  LOGOUT: {
    NOT_LOGGED_IN: { errorMessage: "You are not logged in." },
  },
};
