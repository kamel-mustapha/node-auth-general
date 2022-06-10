import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { User } from "../models/index";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id?: string;
      email?: string;
    }
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  if (user) done(null, user);
});

/*
interface UserPayload {
  id: string;
  email: string;
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (payload: any, done) => {
  const user = payload as UserPayload;
  if (user) done(null, user);
});
*/
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = User.build({
        firstName: profile.name?.givenName!,
        lastName: profile.name?.familyName!,
        email: profile._json.email!,
        password: "123456",
        googleId: profile.id!,
      });
      await user.save();
      return done(null, user);
    }
  )
);
/*
global.signin = () => {
  // Build a JWT payload. {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@gmail.com",
  };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session Object {jwt: MY_JWT}
  const session = { jwt: token };
  //turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  //Take that JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  //return string thats the cookie with the encoded data
  return [`session=${base64}`];
};
*/
