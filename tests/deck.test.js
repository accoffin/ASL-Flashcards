const request = require("supertest");
const app = require("../app");

const DECKERRORS = require("../errors/deck.errors");
const { get } = require("../routes");
const Utilities = require("./TestUtilities");

// ok, so... the current deck is pulled in initially as part of the user data
// from login. But we need additional decks to be rendered if the user has
// multiple decks to select from. Deck CRUD is mandatory, and READ always
// has populated card data

describe("Test deck creation", () => {
  const TEST_DECK = { name: "TEST" };
  const TEST_DECK_SAME_NAME = { name: "TEST" };

  let TEST_CREDENTIALS;
  let TEST_USERID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "TESTABOB",
        password: "1two3Four_flyya38480583yfklg",
      },
      { loggedIn: true }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /deck/create responds with deck title and color", async () => {
    const firstResponse = await request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(TEST_DECK);
    expect(firstResponse.statusCode).toBe(201);
    const firstDeck = firstResponse.body;
    testDocuments.push({ type: "deck", id: firstDeck?._id });
    expect(firstDeck?.name).toBe(TEST_DECK.name);
    expect(firstDeck?.cards).toStrictEqual([]);
    expect(firstDeck?.color).toBe("#000000");

    const user = await Utilities.getUser(TEST_USERID);
    const newestDeckId = user.decks[user.decks.length - 1];
    expect(newestDeckId).toBe(firstDeck._id);

    const sameTitlesHaveDifferentColorsResponse = await request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(TEST_DECK_SAME_NAME);
    expect(sameTitlesHaveDifferentColorsResponse.statusCode).toBe(201);
    const differentColorDeck = sameTitlesHaveDifferentColorsResponse.body;
    testDocuments.push({ type: "deck", id: differentColorDeck?._id });
    expect(differentColorDeck?.color).not.toBe(firstDeck?.color);
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(TEST_DECK)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  test("Error for missing title", () => {
    return request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send({})
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.CREATE.MISSING_NAME.errorMessage
        );
      });
  });
});

describe("Test individual deck retrieval", () => {
  const TEST_CARDS = [
    { gloss: "TEST", gif: "TEST" },
    { gloss: "BLUE", gif: "BLUE" },
  ];
  const TEST_DECK = (TEST_DECK_DIFFERENT_USER = {
    name: "TEST",
    cards: TEST_CARDS,
    color: "#000000",
  });

  let TEST_CREDENTIALS, TEST_USERID, TEST_DECKID, TEST_DIFFERENT_DECKID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      { email: "TEST", password: "1two3Four_flyya38480583yfklg" },
      { loggedIn: true, decks: [TEST_DECK] }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
    TEST_DECKID = testDocuments[testDocuments.length - 3].id;

    const differentUserDocuments = await Utilities.mockUser(
      { email: "TESTY", password: "1two3Four_flyya38480583yfklg" },
      { decks: [TEST_DECK_DIFFERENT_USER] }
    );
    TEST_DIFFERENT_DECKID =
      differentUserDocuments[differentUserDocuments.length - 2].id;
    testDocuments.push(...differentUserDocuments);
  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("GET /deck/:id responds with glosses/gifs for each card in the deck", async () => {
    const response = await request(app)
      .get(`/deck/${TEST_DECKID}`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(response.statusCode).toBe(200);
    const cardInDeck = response.body[1];
    expect(cardInDeck?.gloss).toBeDefined();
    expect(cardInDeck?.gif).toBeDefined;
    expect(Object.keys(cardInDeck).length).toBe(2);
    expect(response.body).toStrictEqual(TEST_CARDS);
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/deck/${TEST_DECKID}/delete`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  test("Error for invalid id", async () => {
    //does not access a different user's deck
    const response = await request(app)
      .get(`/deck/${TEST_DIFFERENT_DECKID}`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.errorMessage).toBe(
      DECKERRORS.GET.DECK_NOT_FOUND.errorMessage
    );
    //handles malformed id
    const malformedId = "DEADBEEF";
    const malformedResponse = await request(app)
      .get(`/deck/${malformedId}`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(malformedResponse.statusCode).toBe(400);
    expect(response.body.errorMessage).toBe(
      DECKERRORS.GET.DECK_NOT_FOUND.errorMessage
    );
  });
});

describe("Test deck updating", () => {
  test("POST /deck/:id/update responds with success", () => {
    //send changes (not the whole deck)
    //contains card ids added and removed
  });

  test("Error for invalid credentials", () => {});

  test("Error for invalid id", () => {});
});

describe("Test deck deletion", () => {
  const TEST_DECK = (TEST_DECK_DIFFERENT_USER = {
    name: "TEST",
    cards: [],
    color: "#000000",
  });

  let TEST_CREDENTIALS, TEST_USERID, TEST_DECKID, TEST_DIFFERENT_DECKID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "TESTABOB",
        password: "1two3Four_flyya38480583yfklg",
      },
      { loggedIn: true, decks: [TEST_DECK] }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
    TEST_DECKID = testDocuments[testDocuments.length - 3].id;

    const differentUserDocuments = await Utilities.mockUser(
      { email: "TESTY", password: "1two3Four_flyya38480583yfklg" },
      { decks: [TEST_DECK_DIFFERENT_USER] }
    );
    TEST_DIFFERENT_DECKID =
      differentUserDocuments[differentUserDocuments.length - 2].id;
    testDocuments.push(...differentUserDocuments);
  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /deck/:id/delete responds with success", async () => {
    const response = await request(app)
      .post(`/deck/${TEST_DECKID}/delete`)
      .set("authorization", `${TEST_CREDENTIALS}`);

    expect(response.statusCode).toBe(200);
    expect(await Utilities.getDeck(TEST_DECKID)).toBe(null);
    const user = await Utilities.getUser(TEST_USERID);
    expect(user?.decks).toStrictEqual([]);
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/deck/${TEST_DECKID}/delete`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  test("Error for invalid id", async () => {
    //does not access a different user's deck
    const response = await request(app)
      .get(`/deck/${TEST_DIFFERENT_DECKID}/delete`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.errorMessage).toBe(
      DECKERRORS.DELETE.DECK_NOT_FOUND.errorMessage
    );
    //handles malformed id
    const BAD_ID = "foobar";
    await request(app)
      .post(`/deck/${BAD_ID}/delete`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.DELETE.DECK_NOT_FOUND.errorMessage
        );
      });
  });
});
