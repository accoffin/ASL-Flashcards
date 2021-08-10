const request = require("supertest");
const app = require("../app");

const User = require("../models/User.model");
const Session = require("../models/Session.model");
const Deck = require("../models/Deck.model");
const Flashcard = require("../models/Flashcard.model");
const ERRORS = require("../errors/auth.errors");

describe("Test the signup route", () => {
  const TEST_USER = {
    email: "TESTABOB1",
    password: "1two3Four_flyya38480583yfklg"
  };

  beforeAll(() => {

  });

  afterAll((done) => {
    User.findOneAndDelete({ email: TEST_USER.email }).then((user) => {
      const deckDelete = Deck.findByIdAndDelete(user.decks[0]).exec();
      const sessionDelete = Session.findOneAndDelete({ user: user._id }).exec();
      Promise.all([deckDelete, sessionDelete]).finally(() => {
        done();
      });
    });
  });

  test("POST /auth/signup responds with user data and session", () => {
    return request(app)
      .post("/auth/signup")
      .send(TEST_USER)
      .then((response) => {
        const { user, session } = response.body;
        expect(response.statusCode).toBe(201);
        expect(session.user).toBe(user._id);
        const currentDeck = user.currentDeck;
        expect(currentDeck.name).toBeDefined();
        expect(currentDeck.cards).toStrictEqual([]);
        expect(currentDeck.color).toBeDefined();
        const firstDeck = user.decks[0];
        expect(firstDeck.name).toBeDefined();
        expect(firstDeck.cards).toStrictEqual([]);
        expect(firstDeck.color).toBeDefined();
        expect(user.currentMode).toBe("receptive");
      });
  });

  test("Error for missing email", () => {
    return request(app)
      .post("/auth/signup")
      .send({ password: TEST_USER.password })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          ERRORS.SIGNUP.MISSING_EMAIL.errorMessage
        );
      });
  });

  test("Error for email already taken", () => {
    return request(app)
      .post("/auth/signup")
      .send(TEST_USER)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          ERRORS.SIGNUP.ALREADY_REGISTERED.errorMessage
        );
      });
  });

  test("Error for missing password", () => {
    return request(app)
      .post("/auth/signup")
      .send({ email: TEST_USER.email })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          ERRORS.SIGNUP.INVALID_PASSWORD.errorMessage
        );
      });
  });

  test("Error for password with 7 characters or less, lacking numbers, and/or lacking uppercase letters", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        email: TEST_USER.email,
        password: "pwd",
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          ERRORS.SIGNUP.INVALID_PASSWORD.errorMessage
        );
      });
  });
});

describe("Test the login route", () => {
  const TEST_EMAIL =  "TESTABOB2";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";

  const TEST_CARD = {
    gloss: "TEST",
    gif: "No URL for gif",
    category: "common phrases",
  };

  beforeAll(() => {
    return request(app)
      .post("/auth/signup")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      .then((response) => {
        return Flashcard.create(TEST_CARD).then(card => { return {
          deck: response.body.user.currentDeck,
          card
        };});
      })
      .then(deckandCard => {
        const {deck, card} = deckandCard;
        return Deck.findByIdAndUpdate(deck._id, {cards: [card._id]})
      })
      .catch((error) => {
        console.log("Error creating test user: ", error);
      });
  });

  afterAll((done) => {
    User.findOneAndDelete({ email: `${TEST_EMAIL}` }).then((user) => {
      const deckDelete = Deck.findByIdAndDelete(user.decks[0]).then(deck => {
        Flashcard.findByIdAndDelete(deck.cards[0]).exec();
      });
      const sessionDelete = Session.findOneAndDelete({ user: user._id }).exec();
      Promise.all([deckDelete, sessionDelete]).finally(() => {
        done();
      });
    });
  });

  test("POST /auth/login responds with User and Session", async () => {
    const response = await request(app).post("/auth/login").send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const { session: firstSession, user: firstUser } = response.body;
    expect(response.statusCode).toBe(201);
    expect(firstSession.user).toBe(firstUser._id);
    expect(firstUser.currentMode).toBeDefined();
    const unselectedDeck = firstUser.decks[0];
    expect(unselectedDeck.name).toBeDefined();
    expect(unselectedDeck.cards).toBeDefined();
    expect(unselectedDeck.color).toBeDefined();
    const currentDeck = firstUser.currentDeck;
    expect(currentDeck.name).toBeDefined();
    expect(currentDeck.cards).toBeDefined();
    expect(currentDeck.color).toBeDefined();
    const cardInDeck = currentDeck.cards[0];
    expect(cardInDeck.gloss).toBeDefined();
    expect(cardInDeck.gif).toBeDefined();
    expect(Object.keys(cardInDeck).length).toBe(3);

    const didSessionRecycleResponse = await request(app)
      .post("/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
    const { session: secondSession } = didSessionRecycleResponse.body;
    expect(secondSession._id).toBe(firstSession._id);
  });

  test("Error for missing email", () => {
    return request(app)
      .post("/auth/login")
      .send({
        password: TEST_PASSWORD,
      })
      .then((response) => {
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGIN.MISSING_EMAIL.errorMessage
        );
      });
  });

  test("Error for unregistered email", () => {
    return request(app)
      .post("/auth/login")
      .send({
        email: "asdfbuipwqeiorn;alihasdofijwqeior23ruipasdfjbheiorqwer;",
        password: TEST_PASSWORD,
      })
      .then((response) => {
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGIN.EMAIL_NOT_FOUND.errorMessage
        );
      });
  });

  test("Error for incorrect password", () => {
    return request(app)
      .post("/auth/login")
      .send({
        email: TEST_EMAIL,
        password: "bad",
      })
      .then((response) => {
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGIN.INCORRECT_PASSWORD.errorMessage
        );
      });
  });
});

describe("Test the logout route", () => {
  const TEST_EMAIL = "TESTABOB3";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";

  let TEST_SESSION = null;

  beforeAll(() => {
    return request(app)
      .post("/auth/signup")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      .then((response) => {
        TEST_SESSION = response.body.session;
      })
      .catch((error) => {
        console.log("Error creating test user: ", error);
      });
  });

  afterAll((done) => {
    User.findOneAndDelete({ email: `${TEST_EMAIL}` }).then((user) => {
      const deckDelete = Deck.findByIdAndDelete(user.decks[0]).exec();
      const sessionDelete = Session.findOneAndDelete({ user: user._id }).exec();
      Promise.all([deckDelete, sessionDelete]).finally(() => {
        done();
      });
    });
  });

  test("POST /auth/logout responds with success", () => {
    return request(app)
      .post("/auth/logout")
      .set("authorization", `${TEST_SESSION._id}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test("Error when header has no authorization", () => {
    return request(app)
      .post("/auth/logout")
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGOUT.NOT_LOGGED_IN.errorMessage
        );
      });
  });
});
