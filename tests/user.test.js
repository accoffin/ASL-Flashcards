const request = require("supertest");
const app = require("../app");

const USERERRORS = require("../errors/user.errors");
const Utilities = require("./TestUtilities");

describe("Test user index routes", () => {
  const TEST_EMAIL = "TESTABOB2";
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

  test("Email confirmation GET /user/:id?confirmation=true responds with success", () => {
    return request(app)
      .get(`/user/${TEST_USERID}?confirmation=true`)
      .then((response) => {
      });
  });

});

describe("Test user update routes", () => {
  const TEST_EMAIL = "TESTABOB2";
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
  };

  let TEST_USER;
  let TEST_CREDENTIALS, TEST_USERID, TEST_FIRSTDECKID, TEST_SECONDDECKID;

  beforeAll(async () => {
    TEST_USER = await Utilities.mockUser(
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
    TEST_CREDENTIALS = TEST_USER[TEST_USER.length - 1].id;
    TEST_USERID = TEST_USER[4].id;
    INPUT.CURRENT_DECK_AND_MODE.currentDeck = TEST_FIRSTDECKID = TEST_USER[3].id;
    INPUT.CURRENT_DECK.currentDeck = TEST_SECONDDECKID = TEST_USER[1].id;
  });


  afterAll(() => {
    return Utilities.tearDown(TEST_USER);
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
          .post(`/user/${TEST_DECKID}/update`)
          .set("authorization", `${TEST_CREDENTIALS}`)
          .send(input);
      }
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/user/${TEST_USERID}/update`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  //error for bad id

  //does not access a diferent user

  //error for invalid mode
    //not expressive or receptive

  //error for invalid deck
    //not in user decks

});

