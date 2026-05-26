const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "testsecret";
jest.mock("../config/db", () => jest.fn());
jest.mock("../models/Comment");

const Comment = require("../models/Comment");
const app = require("../index");
const token = jwt.sign({ id: "user1", name: "Tester" }, "testsecret");

describe("Comment Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET /api/comments/:bookId - returns comments", async () => {
    Comment.find = jest.fn().mockReturnValue({
      sort: () => [{ text: "Great book!", userName: "Tester" }],
    });
    const res = await request(app).get("/api/comments/book123");
    expect(res.status).toBe(200);
  });

  it("POST /api/comments - adds comment", async () => {
    Comment.create = jest
      .fn()
      .mockResolvedValue({ text: "Nice", userName: "Tester" });
    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: "b1", text: "Nice" });
    expect(res.status).toBe(201);
  });

  it("POST /api/comments - 400 if text missing", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: "b1" });
    expect(res.status).toBe(400);
  });

  it("POST /api/comments - 401 without token", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ bookId: "b1", text: "Hi" });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/comments/:id - 404 if not found", async () => {
    Comment.findById = jest.fn().mockResolvedValue(null);
    const res = await request(app)
      .delete("/api/comments/fakeid")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
