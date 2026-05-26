const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "testsecret";
jest.mock("../config/db", () => jest.fn());
jest.mock("../models/Favourite");

const Favourite = require("../models/Favourite");
const app = require("../index");

const token = jwt.sign({ id: "user1" }, "testsecret");

describe("Favourite Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET /api/favourites - returns list", async () => {
    Favourite.countDocuments = jest.fn().mockResolvedValue(1);
    Favourite.find = jest.fn().mockReturnValue({
      sort: () => ({
        skip: () => ({ limit: () => [{ bookId: "b1", title: "Book1" }] }),
      }),
    });
    const res = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("favourites");
  });

  it("POST /api/favourites - adds a book", async () => {
    Favourite.findOne = jest.fn().mockResolvedValue(null);
    Favourite.create = jest
      .fn()
      .mockResolvedValue({ bookId: "b1", title: "Book1" });

    const res = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: "b1", title: "Book1" });
    expect(res.status).toBe(201);
  });

  it("POST /api/favourites - rejects duplicate", async () => {
    Favourite.findOne = jest.fn().mockResolvedValue({ bookId: "b1" });

    const res = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: "b1", title: "Book1" });
    expect(res.status).toBe(400);
  });

  it("DELETE /api/favourites/:bookId - removes a book", async () => {
    Favourite.findOneAndDelete = jest.fn().mockResolvedValue({ bookId: "b1" });

    const res = await request(app)
      .delete("/api/favourites/b1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/favourites - 401 without token", async () => {
    const res = await request(app).get("/api/favourites");
    expect(res.status).toBe(401);
  });
});
