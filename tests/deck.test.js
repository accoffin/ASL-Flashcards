const request = require("supertest");
const app = require("../app");

// ok, so... the current deck is pulled in initially as part of the user data
// from login. But we need additional decks to be rendered if the user has
// multiple decks to select from. Deck CRUD is mandatory, and READ always
// has populated card data

describe("Test deck creation", () => {
  test("POST /deck/create responds with deck title", () => {});

  test("Error for ...", () => {});
});

describe("Test individual deck retrieval", () => {
  test("GET /deck/:id responds with deck title and glosses/gifs for each card", () => {});

  test("Error for ...", () => {});
});

describe("Test deck updating", () => {
  test("POST /deck/:id/update responds with success", () => {});

  test("Error for ...", () => {});
});

describe("Test deck deletion", () => {
  test("POST /deck/:id/delete responds with success", () => {});

  test("Error for ...", () => {});
});
