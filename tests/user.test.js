const request = require("supertest");
const app = require("../app");

const USERERRORS = require("../errors/user.errors");
const Utilities = require("./TestUtilities");

describe("Test user index routes", () => {
  const TEST_EMAIL = "USERTEST";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_CARD = {
    gloss: "TEST",
    gif: "No URL for gif",
    category: "common phrases",
  };

  let TEST_USER;
  let TEST_USERID;

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
    TEST_USERID = TEST_USER[TEST_USER.length - 1].id;
  });


  afterAll(() => {
    return Utilities.tearDown(TEST_USER);
  });

  test("Email confirmation GET /user/:id?confirmation=true responds with success", async () => {
    const response = await request(app).get(`/user/${TEST_USERID}?confirmation=true`);
    const postUpdate = await Utilities.getUser(TEST_USERID);
    expect(response.statusCode).toBe(200);
    expect(postUpdate.emailConfirmed).toBe(true);
  });

});

describe("Test user update routes", () => {
  const TEST_EMAIL = "USERTEST1";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_CARD = {
    gloss: "TEST",
    gif: "No URL for gif",
    category: "common phrases",
  };

  let INPUT = {
    CURRENT_DECK: { currentDeck: null },
    CURRENT_MODE: { currentMode: "expressive" },
    CURRENT_DECK_AND_MODE: { currentDeck: null, currentMode: "receptive" },
    MODE_NOT_EXPRESSIVE_OR_RECEPTIVE: { currentMode: "asdfjkl;" },
    DECKID_NOT_OWNED_BY_USER: { currentDeck: null },
  };

  let testDocuments;
  let TEST_CREDENTIALS, TEST_USERID, TEST_SECONDUSERID, TEST_FIRSTDECKID, TEST_SECONDDECKID;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      {
        loggedIn: true,
        decks: [
          {
            name: "First Deck!",
            color: "#000000",
            cards: [TEST_CARD],
          },
          {
            name: "Second Deck!",
            color: "#000000",
            cards: [TEST_CARD],
          },
        ],
      }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[4].id;
    INPUT.CURRENT_DECK_AND_MODE.currentDeck = TEST_FIRSTDECKID = testDocuments[3].id;
    INPUT.CURRENT_DECK.currentDeck = TEST_SECONDDECKID = testDocuments[1].id;

    const secondUser = await Utilities.mockUser(
      {
        email: "USERTEST2",
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
    TEST_SECONDUSERID = secondUser[secondUser.length - 1].id;
    INPUT.INVALID_DECK = secondUser[secondUser.length - 2].id;
    testDocuments.push(...secondUser);
  });


  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /user/:id/update responds with success", async () => {
    let postUpdate;
    const updateCurrentDeck = await send(INPUT.CURRENT_DECK);
    postUpdate = await Utilities.getUser(TEST_USERID);
    expect(updateCurrentDeck.statusCode).toBe(200);
    expect(postUpdate.currentDeck).toBe(INPUT.CURRENT_DECK.currentDeck);
    expect(postUpdate.currentMode).toBe("receptive");

    const updateCurrentMode = await send(INPUT.CURRENT_MODE);
    postUpdate = await Utilities.getUser(TEST_USERID);
    expect(updateCurrentMode.statusCode).toBe(200);
    expect(postUpdate.currentMode).toBe(INPUT.CURRENT_MODE.currentMode);
    expect(postUpdate.currentDeck).toBe(TEST_SECONDDECKID);
    
    const updateCurrentDeckAndMode = await send(INPUT.CURRENT_DECK_AND_MODE);
    postUpdate = await Utilities.getUser(TEST_USERID);
    expect(updateCurrentDeckAndMode.statusCode).toBe(200);
    expect(postUpdate.currentDeck).toBe(INPUT.CURRENT_DECK_AND_MODE.currentDeck);
    expect(postUpdate.currentMode).toBe(INPUT.CURRENT_DECK_AND_MODE.currentMode);

      function send(input) {
        return request(app)
          .post(`/user/${TEST_USERID}/update`)
          .set("authorization", `${TEST_CREDENTIALS}`)
          .send(input);
      }
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/user/${TEST_USERID}/update`)
      .send({ currentMode: "expressive" })
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          USERERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  test("Error if invalid clearance to update user, or user is incorrect", () => {
    return request(app)
      .post(`/user/${TEST_SECONDUSERID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send({ currentMode: "expressive" })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          USERERRORS.UPDATE.INVALID_USERID.errorMessage
        );
      });
  });

  test("Error for invalid mode", () => {
    return request(app)
      .post(`/user/${TEST_USERID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.MODE_NOT_EXPRESSIVE_OR_RECEPTIVE)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          USERERRORS.UPDATE.INVALID_MODE.errorMessage
        );
      });
  });

  test("Error for invalid current deck", () => {
    return request(app)
      .post(`/user/${TEST_USERID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.DECKID_NOT_OWNED_BY_USER)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          USERERRORS.UPDATE.INVALID_CURRENT_DECK.errorMessage
        );
      });
  });
});

