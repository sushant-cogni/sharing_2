const request = require("supertest");

jest.mock("../config/db", () => jest.fn());
jest.mock("../models/User");

const User = require("../models/User");
const app = require("../index");

describe("Auth Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("POST /api/auth/register", () => {
    it("should register successfully", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue({
        _id: "u1",
        name: "Test",
        email: "test@test.com",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test",
        email: "test@test.com",
        password: "password123",
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/Registration successful/i);
    });

    it("should reject duplicate email", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "u1" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test",
        email: "exists@test.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    it("should reject missing name", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test",
        email: "test@test.com",
        password: "123",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      User.findOne = jest.fn().mockResolvedValue({
        _id: "u1",
        name: "Test",
        email: "test@test.com",
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject wrong password", async () => {
      User.findOne = jest.fn().mockResolvedValue({
        _id: "u1",
        matchPassword: jest.fn().mockResolvedValue(false),
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "wrongpass",
      });
      expect(res.status).toBe(401);
    });

    it("should reject non-existent user", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "ghost@test.com",
        password: "password123",
      });
      expect(res.status).toBe(401);
    });
  });
});
