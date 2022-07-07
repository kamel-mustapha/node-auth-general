import "dotenv/config";
import "./services/passport";
import app from "./app";
import mongoose from "mongoose";
import redis from "./services/redis";

const start = async () => {
  const PORT = process.env.PORT || 3000;

  if (!process.env.GOOGLE_CLIENT_ID)
    throw new Error("GOOGLE_CLIENT_ID must be provided");
  if (!process.env.GOOGLE_CLIENT_SECRET)
    throw new Error("GOOGLE_CLIENT_SECRET must be provided");
  if (!process.env.JWT_KEY) throw new Error("JWT must be provided");
  if (!process.env.MONGO_URI) throw new Error("MONGO-URI must be provided");
  if (!process.env.REDIS_URI) throw new Error("REDIS-URI must be provided");

  try {
    await redis.connect();
    console.log("connected to Redis");
  } catch (err) {
    console.error(err);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb Uri :", process.env.MONGO_URI);
  } catch (err) {
    console.error(err);
  }

  app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}!`));
};

start();
