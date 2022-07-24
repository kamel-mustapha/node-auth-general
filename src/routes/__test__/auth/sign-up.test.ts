import request from "supertest";
import redis from "redis-mock";
import app from "../../../app";

const client = redis.createClient();

it("return a 201 on successful signup", async () => {
  await client.set("test@test.com", JSON.stringify(123456));

  await request(app)
    .post("/api/v1/auth/signup")
    .send({
      firstName: "test",
      lastName: "test",
      email: "test@test.com",
      password: "password",
      code: 123456,
    })
    .expect(201);
});
