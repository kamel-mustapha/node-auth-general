import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { User } from "../models/index";

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
  // const user = await User.findById(id);
  // if (user) done(null, user);
});

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
      const username = `${profile.name?.givenName!}.${profile.name
        ?.familyName!}${Math.floor(100 + Math.random() * 900)}`;
      const user = User.build({
        firstName: profile.name?.givenName!,
        lastName: profile.name?.familyName!,
        username,
        email: profile._json.email!,
        password: process.env.GOOGLE_DEFAULT_PASSWORD! || "123",
        googleId: profile.id!,
        verified: true,
      });
      await user.save();
      return done(null, user);
    }
  )
);
