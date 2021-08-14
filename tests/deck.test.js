const request = require("supertest");
const app = require("../app");

const DECKERRORS = require("../errors/deck.errors");
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
    testDocuments = await Utilities.mockUser({
      email: "TESTABOB",
      password: "1two3Four_flyya38480583yfklg"
    },
    { loggedIn: true }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /deck/create responds with deck title", async () => {
    const firstResponse = await request(app)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .post("/deck/create")
      .send(TEST_DECK);
    expect(firstResponse.statusCode).toBe(201);
    const firstDeck = firstResponse.body;
    testDocuments.push({type: "deck", id: firstDeck?._id});
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
    testDocuments.push({type: "deck", id: differentColorDeck?._id});
    expect(differentColorDeck?.color).not.toBe(firstDeck?.color);
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(TEST_DECK)
      .then(response => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(DECKERRORS.AUTH.UNAUTHORIZED.errorMessage);
      });
  });

  test("Error for missing title", () => {
    return request(app)
      .post("/deck/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send({})
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(DECKERRORS.CREATE.MISSING_NAME.errorMessage);
      });
  });
});

// describe("Test individual deck retrieval", () => {
//   test("GET /deck/:id responds with deck title and glosses/gifs for each card", () => {});

//   test("Error for ...", () => {});
// });

// describe("Test deck updating", () => {
//   test("POST /deck/:id/update responds with success", () => {});

//   test("Error for missing title", () => {});

//   test("Error for invalid title", () => {});
// });

// describe("Test deck deletion", () => {
//   test("POST /deck/:id/delete responds with success", () => {});

//   test("Error for ...", () => {});
// });
