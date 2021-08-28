const request = require("supertest");
const app = require("../app");

const DECKERRORS = require("../errors/deck.errors");
const Utilities = require("./TestUtilities");


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
  const TEST_DECK = (TEST_DECK_DIFFERENT_USER = {
    name: "TEST",
    cards: [
      { gloss: "RED", gif: "red", category: "colors" },
      { gloss: "BLUE", gif: "blue", category: "colors" },
      { gloss: "GREEN", gif: "green", category: "colors" },
      { gloss: "YELLOW", gif: "yellow", category: "colors" },
      { gloss: "BLACK", gif: "black", category: "colors" },
      { gloss: "PURPLE", gif: "purple", category: "colors" },
    ],
    color: "#000000",
  });

  const INPUT = {
    NAME_ONLY: { name: "NEW_NAME" },
    COLOR_ONLY: { color: "NEW_COLOR" },
    NAME_AND_COLOR: { name: "NAME", color: "COLOR" },
    REMOVE_CARDS: { remove: null },
    ADD_CARDS: { add: null },
    ADD_AND_REMOVE_CARDS: { add: null, remove: null },
    ADD_CARD_ALREADY_PRESENT: { add: null },
    REMOVE_CARD_NOT_FOUND: { remove: null },
  };
  function setInputCards(cardIds) {
    INPUT.REMOVE_CARDS.remove = [cardIds[0], cardIds[2], cardIds[4]];
    INPUT.ADD_CARDS.add = [cardIds[4], cardIds[2], cardIds[0]];
    INPUT.ADD_AND_REMOVE_CARDS.remove = cardIds;
    INPUT.ADD_AND_REMOVE_CARDS.add = [cardIds[0], cardIds[1]];

    INPUT.ADD_CARD_ALREADY_PRESENT.add = [cardIds[0]];
    INPUT.REMOVE_CARD_NOT_FOUND.remove = [cardIds[2]];
  }

  let TEST_CREDENTIALS,
    TEST_USERID,
    TEST_DECKID,
    TEST_CARDIDS,
    TEST_DIFFERENT_DECKID,
    TEST_DESTROY_CARD;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "TESTABOB",
        password: "1two3Four_flyya38480583yfklg",
      },
      { loggedIn: true, decks: [TEST_DECK] }
    );
    TEST_DESTROY_CARD = testDocuments[testDocuments.length - 4];
    [TEST_CREDENTIALS, TEST_USERID, TEST_DECKID, ...TEST_CARDIDS] =
      testDocuments.reverse().map((doc) => doc.id);

    setInputCards(TEST_CARDIDS);

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

  test("POST /deck/:id/update responds with success", async () => {
    let postUpdate; 
    const updateName = await send(INPUT.NAME_ONLY);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(updateName.statusCode).toBe(200);
    expect(postUpdate.name).toBe(INPUT.NAME_ONLY.name);
    expect(postUpdate.color).toBe("#000000");

    const updateColor = await send(INPUT.COLOR_ONLY);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(updateColor.statusCode).toBe(200);
    expect(postUpdate.color).toBe(INPUT.COLOR_ONLY.color);
    expect(postUpdate.name).toBe("NEW_NAME");

    const updateNameAndColor = await send(INPUT.NAME_AND_COLOR);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(updateNameAndColor.statusCode).toBe(200);
    expect(postUpdate.name).toBe(INPUT.NAME_AND_COLOR.name);
    expect(postUpdate.color).toBe(INPUT.NAME_AND_COLOR.color);

    const removeCards = await send(INPUT.REMOVE_CARDS);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(removeCards.statusCode).toBe(200);
    expect(postUpdate.cards).toStrictEqual([TEST_CARDIDS[1], TEST_CARDIDS[3], TEST_CARDIDS[5]]);
    
    const addCards = await send(INPUT.ADD_CARDS);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(addCards.statusCode).toBe(200);
    expect(postUpdate.cards).toStrictEqual([
      TEST_CARDIDS[1], 
      TEST_CARDIDS[3], 
      TEST_CARDIDS[5],
      TEST_CARDIDS[4],
      TEST_CARDIDS[2],
      TEST_CARDIDS[0],
    ]);

    const addAndRemoveCards = await send(INPUT.ADD_AND_REMOVE_CARDS);
    postUpdate = await Utilities.getDeck(TEST_DECKID);
    expect(addAndRemoveCards.statusCode).toBe(200);
    expect(postUpdate.cards).toStrictEqual([TEST_CARDIDS[0], TEST_CARDIDS[1]]);

    function send(input) {
      return request(app)
        .post(`/deck/${TEST_DECKID}/update`)
        .set("authorization", `${TEST_CREDENTIALS}`)
        .send(input);
    }
  });

  test("Error for invalid card id", async () => {
    const removeAbsentId = await send(INPUT.REMOVE_CARD_NOT_FOUND);
    expect(removeAbsentId.statusCode).toBe(400);
    expect(removeAbsentId.body.errorMessage).toBe(DECKERRORS.REMOVE_ABSENT_CARD.errorMessage);

    const addDuplicateId = await send(INPUT.ADD_CARD_ALREADY_PRESENT);
    expect(addDuplicateId.statusCode).toBe(400);
    expect(addDuplicateId.body.errorMessage).toBe(DECKERRORS.ADD_DUPLICATE_CARD.errorMessage);

    //remove a card from the db
    const nonExistentCardID = TEST_DESTROY_CARD.id;
    await Utilities.tearDown([TEST_DESTROY_CARD]);

    const addNonExistentId = await send({ add: [nonExistentCardID] });
    expect(addNonExistentId.statusCode).toBe(400);
    expect(addNonExistentId.body.errorMessage).toBe(DECKERRORS.ADD_NONEXISTENT_CARD.errorMessage);

    function send(input) {
      return request(app)
        .post(`/deck/${TEST_DECKID}/update`)
        .set("authorization", `${TEST_CREDENTIALS}`)
        .send(input);
    }
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/deck/${TEST_DECKID}/update`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.AUTH.UNAUTHORIZED.errorMessage
        );
      });
  });

  test("Error for invalid deck id", async () => {
    //does not access a different user's deck
    const response = await request(app)
      .post(`/deck/${TEST_DIFFERENT_DECKID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.errorMessage).toBe(
      DECKERRORS.UPDATE.DECK_NOT_FOUND.errorMessage
    );
    const BAD_ID = "foobar";
    await request(app)
      .post(`/deck/${BAD_ID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(
          DECKERRORS.UPDATE.DECK_NOT_FOUND.errorMessage
        );
      });
  });
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
