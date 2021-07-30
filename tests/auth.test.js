const request = require("supertest");
const app = require("../app");

describe("Test the signup route", () => {
  test("POST /auth/signup responds with user data and session", () => {
  });

  test("Error for missing username", () => {
  });

  test("Error for username already taken", () => {
  });

  test("Error for missing password", () => {
  });

  test("Error for invalid password", () => {
  });

  test("Error when header already has authorization", () => {
  });
});

describe("Test the login route", () => {
  test("POST /auth/login responds with User and Session", () => {
  });

  test("Error for missing username", () => {
  });

  test("Error for unregistered username", () => {
  });

  test("Error for incorrect password", () => {
  });

  test("Error when header already has authorization", () => {
  });
});

describe("Test the logout route", () => {
  test("POST /auth/logout responds with success", () => {
  });

  test("Error when header has no authorization", () => {
  });
});