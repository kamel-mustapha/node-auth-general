import express from "express";
import multer from "multer";
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
  forgotPasswordViaPasswordToken,
  verifyPasswordToken,
  resetPasswordVaiPasswordToken,
  uploadProfilePictureToDrive,
  checkEmailExistence,
  checkUsernameExistence,
  checkPhoneExistence,
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
  verifyResetPasswordValidator,
  phoneNumberValidator,
  usernameValidator,
} from "../validators/auth";
import {
  requireAuth,
  validateRequest,
  passwordTokenHandler,
} from "../middlewares";
import passport from "passport";

const upload = multer();

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

router.post(
  "/forgotPasswordViaPasswordToken",
  forgotPasswordValidator,
  validateRequest,
  forgotPasswordViaPasswordToken
);
router.post(
  "/verifyPasswordToken",
  verifyResetPasswordValidator,
  validateRequest,
  passwordTokenHandler,
  verifyPasswordToken
);
router.post(
  "/resetPasswordVaiPasswordToken",
  resetPasswordValidator,
  validateRequest,
  passwordTokenHandler,
  resetPasswordVaiPasswordToken
);
router.post(
  "/uploadProfilePicture/:id",
  requireAuth,
  upload.single("file"),
  userIdValidator,
  validateRequest,
  uploadProfilePictureToDrive
);
router.post(
  "/checkUsernameExistence",
  usernameValidator,
  validateRequest,
  checkUsernameExistence
);
router.post(
  "/checkEmailExistence",
  emailValidator,
  validateRequest,
  checkEmailExistence
);
router.post(
  "/checkPhoneExistence",
  phoneNumberValidator,
  validateRequest,
  checkPhoneExistence
);

export default router;
