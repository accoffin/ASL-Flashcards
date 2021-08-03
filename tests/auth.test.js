const request = require("supertest");
const app = require("../app");

const User = require("../models/User.model");

describe("Test the signup route", () => {
  const TEST_USER = "TESTABOB";
  const TEST_PASSWORD = "1two3Four_flyya38480583yfklg";
  const TEST_ADMIN = false;

  afterAll( (done) => {
    User.findOneAndDelete({ username: `${TEST_USER}` }).exec(done);
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
        console.log(response.body);
        expect(response.statusCode).toBe(201);
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
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error for username already taken", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error for missing password", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error for password with 7 characters or less, lacking numbers, and/or lacking uppercase letters", () => {
    return request(app)
      .post("/auth/signup")
      .send({
        username: TEST_USER,
        password: "pwd",
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
      });
  });

  test("Error when header already has authorization", () => {
    return request(app)
      .post("/auth/signup")
      .set("authorization", "foobar")
      .send({
        username: TEST_USER,
        password: TEST_PASSWORD,
        isAdmin: TEST_ADMIN,
      })
      .then((response) => {
        expect(response.statusCode).toBe(403);
      });
  });
});

// describe("Test the login route", () => {
//   test("POST /auth/login responds with User and Session", () => {});

//   test("Error for missing username", () => {});

//   test("Error for unregistered username", () => {});

//   test("Error for incorrect password", () => {});

//   test("Error when header already has authorization", () => {});
// });

// describe("Test the logout route", () => {
//   test("POST /auth/logout responds with success", () => {});

//   test("Error when header has no authorization", () => {});
// });
