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
  sendEmailCode,
  storeValue,
  retrieveValue,
  confirmEmail,
  forgotPassword,
  resetPassword,
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
  emailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
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
  .get(requireAuth, userIdValidator, validateRequest, getUser)
  .put(requireAuth, updateUserValidator, validateRequest, updateUser)
  .delete(requireAuth, userIdValidator, validateRequest, deleteUser)
  .post(requireAuth, findUsersValidator, validateRequest, findUsers);

router.put(
  "/password/:id",
  requireAuth,
  updatePasswordValidator,
  validateRequest,
  updateUserPassword
);

router.post(
  "/forgotPassword",
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post(
  "/resetPassword",
  resetPasswordValidator,
  validateRequest,
  resetPassword
);

router.post("/sendEmailCode", emailValidator, validateRequest, sendEmailCode);
router.post("/confirmEmailCode", confirmEmail);

router.post("/sendPhoneCode", phoneValidator, validateRequest, sendPhoneSMS);
router.post(
  "/confirmPhone",
  confirmPhoneValidator,
  validateRequest,
  confirmPhone
);

router.post("/storeValue", storeValue);
router.post("/retrieveValue", retrieveValue);

router.get("/require", requireAuth, (req, res) => {
  console.log("you are here");
  res.send("you are authorized");
});

export default router;
