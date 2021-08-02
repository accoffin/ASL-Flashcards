const request = require("supertest");
const app = require("../app");

const User = require("../models/User.model");

describe("Test the signup route", () => {
  const TEST_USER = "TESTABOB";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_ADMIN = false;

  afterAll((done) => {
    User.findOneAndDelete({ username: `${TEST_USER}` }).exec();
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
        console.log(response);
        expect(response.statusCode).toBe(400);
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
        console.log(response);
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error for username already taken", () => {});

  test("Error for missing password", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        console.log(response);
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error for invalid password", () => {});

  test("Error when header already has authorization", () => {});
});

describe("Test the login route", () => {
  test("POST /auth/login responds with User and Session", () => {});

  test("Error for missing username", () => {});

  test("Error for unregistered username", () => {});

  test("Error for incorrect password", () => {});

  test("Error when header already has authorization", () => {});
});

describe("Test the logout route", () => {
  test("POST /auth/logout responds with success", () => {});

  test("Error when header has no authorization", () => {});
});
