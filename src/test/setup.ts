import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app";

declare global {
  function signin(): Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const user = {
    firstName: "test",
    lastName: "test",
    email: "test@test.com",
    password: "password",
  };

  const response = await request(app)
    .post("/api/v1/auth/signup")
    .send(user)
    .expect(201);

  const cookie = response.get("Set-Cookie");
  return cookie;
};
