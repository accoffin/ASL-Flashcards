const request = require("supertest");
const app = require("../app");

describe("Test the root path", () => {

  afterAll( (done) => {
    done();
  });

  test("GET / responds with success", () => {
    return request(app)
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });
});