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
    request(app)
      .post("flashcard/create")
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT.MISSING_GLOSS)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errorMessage).toBe(FLASHCARDERRORS.MISSING_GLOSS.errorMessage);
      });
  });

  test("Error for missing gif", () => {
    request(app)
    .post("flashcard/create")
    .set("authorization", `${TEST_CREDENTIALS}`)
    .send(INPUT.MISSING_GLOSS)
    .then((response) => {
      expect(response.statusCode).toBe(400);
      expect(response.body.errorMessage).toBe(FLASHCARDERRORS.MISSING_GIF.errorMessage);
    });
  });
  
  test("Error for invalid credentials", () => {
    request(app)
    .post("flashcard/create")
    .send({ gloss: "TEST", gif: "www.cards.com/test" })
    .then((response) => {
      expect(response.statusCode).toBe(403);
      expect(response.body.errorMessage).toBe(FLASHCARDERRORS.AUTH.errorMessage);
    });
  });
});

describe("flashcard retrieval", () => {
 
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

});

describe("flashcard updating", () => {
 
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

});

describe("flashcard deletion", () => {
 
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

});