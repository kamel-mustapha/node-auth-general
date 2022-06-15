import express from "express";
import {
  currentUser,
  signIn,
  signUp,
  signOut,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUser,
  findUsers,
  sendPhoneSMS,
  confirmPhone,
} from "../controllers/auth";
import {
  findUsersValidator,
  signInValidator,
  signUpValidator,
  updatePasswordValidator,
  updateUserValidator,
  userIdValidator,
  phoneValidator,
  confirmPhoneValidator,
} from "../validators/auth";
import { requireAuth, validateRequest } from "../middlewares";
import passport from "passport";

const router = express.Router();

router.post("/signup", signUpValidator, validateRequest, signUp);
router.post("/signin", signInValidator, validateRequest, signIn);
router.post("/signout", signOut);
router.get("/currentuser", currentUser);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router
  .route("/users/:id")
  .get(userIdValidator, validateRequest, getUser)
  .put(updateUserValidator, validateRequest, updateUser)
  .delete(userIdValidator, validateRequest, deleteUser)
  .post(findUsersValidator, validateRequest, findUsers);

router.put(
  "/password/:id",
  updatePasswordValidator,
  validateRequest,
  updateUserPassword
);

router.post("/sendPhoneCode", phoneValidator, validateRequest, sendPhoneSMS);
router.post(
  "/confirmPhone",
  confirmPhoneValidator,
  validateRequest,
  confirmPhone
);

router.get("/require", requireAuth, (req, res) => {
  console.log("you are here");
  res.send("you are authorized");
});

export default router;
