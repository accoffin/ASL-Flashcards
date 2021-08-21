const request = require("supertest");
const app = require("../app");

const AUTHERRORS = require("../errors/auth.errors");
const Utilities = require("./TestUtilities");

describe("Test the signup route", () => {
  const TEST_USER = {
    email: "TESTABOB1",
    password: "1two3Four_flyya38480583yfklg",
  };

  const testUserDocuments = [];

  afterAll(() => {
    return Utilities.tearDown(testUserDocuments);
  });

  test("POST /auth/signup responds with user data and session", () => {
    //signup also sends a confirmation email to the provided address
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
        testUserDocuments.push(
          { type: "user", id: user._id },
          { type: "session", id: session._id },
          { type: "deck", id: firstDeck._id }
        );
      });
  });

  test("Error for missing email", () => {
    return request(app)
      .post("/auth/signup")
      .send({ password: TEST_USER.password })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          AUTHERRORS.SIGNUP.MISSING_EMAIL.errorMessage
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
          AUTHERRORS.SIGNUP.ALREADY_REGISTERED.errorMessage
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
          AUTHERRORS.SIGNUP.INVALID_PASSWORD.errorMessage
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
          AUTHERRORS.SIGNUP.INVALID_PASSWORD.errorMessage
        );
      });
  });
});

describe("Test the login route", () => {
  const TEST_EMAIL = "TESTABOB2";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_CARD = {
    gloss: "TEST",
    gif: "No URL for gif",
    category: "common phrases",
  };

  let TEST_USER;

  beforeAll(async () => {
    TEST_USER = await Utilities.mockUser(
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      {
        decks: [
          {
            name: "First Deck!",
            color: "#000000",
            cards: [TEST_CARD],
          },
        ],
      }
    );
  });

  afterAll(() => {
    return Utilities.tearDown(TEST_USER);
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
    expect(Object.keys(cardInDeck).length).toBe(2);
    TEST_USER.push({ type: "session", id: firstSession._id });

    const didSessionRecycleResponse = await request(app)
      .post("/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
    const { session: secondSession } = didSessionRecycleResponse.body;
    expect(didSessionRecycleResponse.statusCode).toBe(200);
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
          AUTHERRORS.LOGIN.MISSING_EMAIL.errorMessage
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
          AUTHERRORS.LOGIN.EMAIL_NOT_FOUND.errorMessage
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
          AUTHERRORS.LOGIN.INCORRECT_PASSWORD.errorMessage
        );
      });
  });
});

describe("Test the logout route", () => {
  const TEST_EMAIL = "TESTABOB3";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";

  let TEST_SESSION;
  let TEST_USER;

  beforeAll(async () => {
    TEST_USER = await Utilities.mockUser(
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      { loggedIn: true }
    );
    TEST_SESSION = TEST_USER[TEST_USER.length - 1].id;
  });

  afterAll(() => {
    Utilities.tearDown(TEST_USER);
  });

  test("POST /auth/logout responds with success", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `${TEST_SESSION}`);

    expect(response.statusCode).toBe(200);
    expect(await Utilities.getSession(TEST_SESSION)).toBe(null);
  });

  test("Error when header has no authorization", () => {
    return request(app)
      .post("/auth/logout")
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          AUTHERRORS.LOGOUT.NOT_LOGGED_IN.errorMessage
        );
      });
  });
});
