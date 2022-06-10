import request from "supertest";
import app from "../../../app";

it("return a 200 on successful signin", async () => {
  await request(app)
    .post("/api/v1/auth/signup")
    .send({
      firstName: "test",
      lastName: "test",
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/v1/auth/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
});
