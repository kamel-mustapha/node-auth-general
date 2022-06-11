import express from "express";
import {
  currentUser,
  signIn,
  signUp,
  signOut,
} from "../controllers/auth";
import { signInValidator, signUpValidator } from "../validators/auth";
import { requireAuth, validateRequest } from "../middlewares";
import passport from "passport";

const router = express.Router();

router.get("/currentuser", currentUser);
router.post("/signup", signUpValidator, validateRequest, signUp);
router.post("/signin", signInValidator, validateRequest, signIn);
router.post("/signout", signOut);
router.get("/google", passport.authenticate("google", {scope: ["email", "profile"]}));

router.get("/require", requireAuth, (req, res) => {
  console.log("you are here");
  res.send("you are authorized");
});

export default router;
