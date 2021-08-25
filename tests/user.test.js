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

  let INPUT;

  let TEST_USER;
  let TEST_CREDENTIALS, TEST_USERID;

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
        ],
      }
    );
    TEST_CREDENTIALS = TEST_USER[TEST_USER.length - 1].id;
    TEST_USERID = TEST_USER[TEST_USER.length - 2].id;
  });


  afterAll(() => {
    return Utilities.tearDown(TEST_USER);
  });

  test("POST /user/:id/update responds with success", async () => {
    const currentDeckRequest = await request(app)
      .post(`/user/${TEST_USERID}/update`)
      .set("authorization", `${TEST_CREDENTIALS}`)
      .send(INPUT);
      //current deck change
      //current mode change
  });

  //error for invalid credentials

  //error for bad id

  //does not access a diferent user

  //error for invalid mode

  //error for invalid deck

});

