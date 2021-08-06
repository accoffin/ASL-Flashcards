const request = require("supertest");
const app = require("../app");

const User = require("../models/User.model");
const Session = require("../models/Session.model");
const Deck = require("../models/Deck.model");
const ERRORS = require("../errors/auth.errors");

describe("Test the signup route", () => {
  const TEST_USER = "TESTABOB";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_ADMIN = false;

  afterAll((done) => {
    User.findOneAndDelete({ username: `${TEST_USER}` }).then((user) => {
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
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        const { user, session } = response.body;
        console.log(response.body);
        expect(response.statusCode).toBe(201);
        expect(session.user).toBe(user._id);

        expect(user.currentDeck?.name).toBeDefined();
        expect(user.currentDeck?.cards).toBeDefined();
        expect(user.currentMode).toBeDefined();
      });
  });

  test("Error for missing username", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          ERRORS.SIGNUP.MISSING_USERNAME.errorMessage
        );
      });
  });

  test("Error for username already taken", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
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
      .send({
        username: TEST_USER,
        isAdmin: TEST_ADMIN,
      })
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
        username: TEST_USER,
        password: "pwd",
        isAdmin: TEST_ADMIN,
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
  const TEST_USER = "TESTABOB";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_ADMIN = false;

  beforeAll(() => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        // console.log(`Created Test User: ${response.body.user.username}`);
      })
      .catch((error) => {
        console.log("Error creating test user: ", error);
      });
  });

  afterAll((done) => {
    User.findOneAndDelete({ username: `${TEST_USER}` }).then((user) => {
      const deckDelete = Deck.findByIdAndDelete(user.decks[0]).exec();
      const sessionDelete = Session.findOneAndDelete({ user: user._id }).exec();
      Promise.all([deckDelete, sessionDelete]).finally(() => {
        done();
      });
    });
  });

  test("POST /auth/login responds with User and Session", async () => {
    const response = await request(app).post("/auth/login").send({
      username: TEST_USER,
      password: TEST_PASSWORD,
    });
    const { session: firstSession, user: firstUser } = response.body;
    expect(response.statusCode).toBe(201);
    expect(firstSession.user).toBe(firstUser._id);

    expect(firstUser.currentDeck?.name).toBeDefined();
    expect(firstUser.currentDeck?.cards).toBeDefined();
    expect(firstUser.currentMode).toBeDefined();

    const didSessionRecycleResponse = await request(app)
      .post("/auth/login")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
      });
    const { session: secondSession } = didSessionRecycleResponse.body;
    expect(secondSession._id).toBe(firstSession._id);
  });

  test("Error for missing username", () => {
    return request(app)
      .post("/auth/login")
      .send({
        password: TEST_PASSWORD,
      })
      .then((response) => {
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGIN.MISSING_USERNAME.errorMessage
        );
      });
  });

  test("Error for unregistered username", () => {
    return request(app)
      .post("/auth/login")
      .send({
        username: "asdfbuipwqeiorn;alihasdofijwqeior23ruipasdfjbheiorqwer;",
        password: TEST_PASSWORD,
      })
      .then((response) => {
        expect(response.body.errorMessage).toBe(
          ERRORS.LOGIN.USER_NOT_FOUND.errorMessage
        );
      });
  });

  test("Error for incorrect password", () => {
    return request(app)
      .post("/auth/login")
      .send({
        username: TEST_USER,
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
  const TEST_USER = "TESTABOB";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_ADMIN = false;

  let TEST_SESSION = null;

  beforeAll(() => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        TEST_SESSION = response.body.session;
      })
      .catch((error) => {
        console.log("Error creating test user: ", error);
      });
  });

  afterAll((done) => {
    User.findOneAndDelete({ username: `${TEST_USER}` }).then((user) => {
      const deckDelete = Deck.findByIdAndDelete(user.currentDeck).exec();
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
