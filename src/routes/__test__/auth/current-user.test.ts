import request from "supertest";
import app from "../../../app";

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/v1/auth/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});

it("responds with details about the current user", async () => {
  const cookie = await signin();

  const response = await request(app)
    .get("/api/v1/auth/currentuser")
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});
