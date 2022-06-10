import request from "supertest";
import app from "../../../app";

it("return a 201 on successful signup", async () => {
  await request(app)
    .post("/api/v1/auth/signup")
    .send({
      firstName: "test",
      lastName: "test",
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});
