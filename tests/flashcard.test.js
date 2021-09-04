const { response } = require("express");
const request = require("supertest");
const app = require("../app");

const FLASHCARDERRORS = require("../errors/flashcard.errors");
const Utilities = require("./TestUtilities");

describe("flashcard creation", () => {
 
  const INPUT = {
    NEW_FLASHCARD: { gloss: "TEST", gif: "www.cards.com/test", },
    MISSING_GLOSS: { gif: "www.cards.com/test" },
    MISSING_GIF: { gloss: "TEST" },
  };

  let TEST_CREDENTIALS;
  let TEST_USERID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "FLASHCARDTEST",
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

  test("POST /flashcard/create responds with new flashcard id", async () => {
    const response = await request(app)
      .post("/flashcard/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.NEW_FLASHCARD);
    const postCreate = await Utilities.getCards();
    const newCard = postCreate[postCreate.length - 1];
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(newCard._id);
    expect(Object.keys(response.body).length).toBe(1);
    expect(newCard.gloss).toBe(INPUT.NEW_FLASHCARD.gloss);
    expect(newCard.gif).toBe(INPUT.NEW_FLASHCARD.gif);
  });

  test("Error for missing gloss", () => {
    return request(app)
      .post("/flashcard/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.MISSING_GLOSS)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.MISSING_GLOSS.errorMessage);
      });
  });

  test("Error for missing gif", () => {
    return request(app)
      .post("/flashcard/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.MISSING_GLOSS)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.MISSING_GIF.errorMessage);
      });
  });
  
  test("Error for invalid credentials", () => {
    return request(app)
      .post("/flashcard/create")
      .send({ gloss: "TEST", gif: "www.cards.com/test" })
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.AUTH.UNAUTHORIZED.errorMessage);
      });
  });
});

describe("flashcard retrieval", () => {
 
  const INPUT = {
    // NEW_FLASHCARD: { gloss: "TEST", gif: "www.cards.com/test", },
  };

  let TEST_CREDENTIALS;
  let TEST_USERID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "FLASHCARDTEST1",
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

  // test("GET /flashcard/index responds with all flashcards", () => {

  // });

  // test("GET /flashcard/index?limit=n responds with the first n flashcards", () => {

  // });

  // test("GET /flashcard/index?skip=m&limit=n responds with the first n flashcards after the mth", () => {

  // });

  // test("GET /flashcard/index?challengeBatch=n responds with n challenge algorithm selected batches of flashcards", () => {

  // });
  
  test("Error for invalid credentials", () => {
    return request(app)
      .get(`/flashcard/index`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.AUTH.NOT_SIGNED_IN.errorMessage);
      });
  });
});

describe("flashcard updating", () => {
  const TEST_DECK = (TEST_DECK_DIFFERENT_USER = {
    name: "TEST",
    cards: [
      { gloss: "RED", gif: "red" },
    ],
    color: "#000000",
  });
 
  const INPUT = {
    GLOSS_ONLY: { gloss: "TEST" },
    GIF_ONLY: { gif: "www.cards.com/test" },
    GLOSS_AND_GIF: { gloss: "BLUE", gif: "www.cards.com/blue" },
  };

  let TEST_CREDENTIALS;
  let TEST_USERID, TEST_CARDID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "FLASHCARDTEST2",
        password: "1two3Four_flyya38480583yfklg",
        isAdmin: true,
      },
      { 
        loggedIn: true,
        decks: [TEST_DECK],
      }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
    TEST_CARDID = testDocuments[0].id;

  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /flashcard/:id/update responds with success", async () => {
    const glossOnlyResponse = await send(INPUT.GLOSS_ONLY);
    let postUpdate = await Utilities.getCard(TEST_CARDID);
    expect(glossOnlyResponse.statusCode).toBe(200);
    expect(postUpdate.gloss).toBe(INPUT.GLOSS_ONLY.gloss);
    expect(postUpdate.gif).toBe("red");

    const gifOnlyResponse = await send(INPUT.GIF_ONLY);
    postUpdate = await send(TEST_CARDID);
    expect(gifOnlyResponse.statusCode).toBe(200);
    expect(postUpdate.gloss).toBe(INPUT.GLOSS_ONLY.gloss);
    expect(postUpdate.gif).toBe(INPUT.GIF_ONLY.gif);

    const glossAndGifResponse = await send(INPUT.GLOSS_AND_GIF);
    postUpdate = await Utilities.getCard(TEST_CARDID);
    expect(glossAndGifResponse.statusCode).toBe(200);
    expect(postUpdate.gloss).toBe(INPUT.GLOSS_AND_GIF.gloss);
    expect(postUpdate.gif).toBe(INPUT.GLOSS_AND_GIF.gif);

    function send(input) {
      return request(app)
        .post(`/card/${TEST_CARDID}/update`)
        .set("authorization", `${TEST_CREDENTIALS}`)
        .send(input);
    }
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/flashcard/${TEST_CARDID}/update`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.AUTH.UNAUTHORIZED.errorMessage);
      });
  });

});

describe("flashcard deletion", () => {
  const TEST_DECK = (TEST_DECK_DIFFERENT_USER = {
    name: "TEST",
    cards: [
      { gloss: "RED", gif: "red" },
    ],
    color: "#000000",
  });
 
  const INPUT = {
    NEW_FLASHCARD: { gloss: "TEST", gif: "www.cards.com/test", },
    MISSING_GLOSS: { gif: "www.cards.com/test" },
    MISSING_GIF: { gloss: "TEST" },
  };

  let TEST_CREDENTIALS;
  let TEST_USERID, TEST_CARDID;

  let testDocuments;

  beforeAll(async () => {
    testDocuments = await Utilities.mockUser(
      {
        email: "FLASHCARDTEST3",
        password: "1two3Four_flyya38480583yfklg",
        isAdmin: true,
      },
      { 
        loggedIn: true,
        decks: [TEST_DECK],
      }
    );
    TEST_CREDENTIALS = testDocuments[testDocuments.length - 1].id;
    TEST_USERID = testDocuments[testDocuments.length - 2].id;
    TEST_CARDID = testDocuments[0].id;

  });

  afterAll(() => {
    return Utilities.tearDown(testDocuments);
  });

  test("POST /flashcard/:id/delete responds with success", async () => {
    const deleteResponse = await request(app)
      .post(`/flashcard/${TEST_CARDID}/delete`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    const postDelete = await Utilities.getCards();
    expect(deleteResponse.statusCode).toBe(200);
    expect(postDelete.length).toBe(0);
  });

  test("Error for invalid card Id", async () => {
    const noCards = await Utilities.getCards();
    expect(noCards.length).toBe(0);
    const invalidIdResponse = await request(app)
      .post(`/flashcard/${TEST_CARDID}/delete`)
      .set("authorization", `${TEST_CREDENTIALS}`);
    expect(invalidIdResponse.statusCode).toBe(400);
    expect(invalidIdResponse.body.errorMessage).toBe(FLASHCARDERRORS.DELETE.CARD_NOT_FOUND.errorMessage);
  });

  test("Error for invalid credentials", () => {
    return request(app)
      .post(`/flashcard/${TEST_CARDID}/delete`)
      .then((response) => {
        expect(response.statusCode).toBe(403);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.AUTH.UNAUTHORIZED.errorMessage);
      });
  });

});