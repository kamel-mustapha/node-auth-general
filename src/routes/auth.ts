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
  forgotPasswordViaRedis,
  resetPasswordViaRedis,
  forgotPasswordViaPasswordToken,
  verifyPasswordToken,
  resetPasswordVaiPasswordToken,
  uploadProfilePictureToDrive,
  checkEmailExistence,
  checkUsernameExistence,
  checkPhoneExistence,
  getHashRedis,
  setHashRedis,
  registerUser,
  verifyAccount,
  updateEmail,
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
router.post("/verifyAccount", verifyAccount);
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
  "/forgotPasswordViaRedis",
  forgotPasswordValidator,
  validateRequest,
  forgotPasswordViaRedis
);
router.post(
  "/resetPasswordViaRedis",
  resetPasswordValidator,
  validateRequest,
  resetPasswordViaRedis
);

router.post("/sendEmailCode", emailValidator, validateRequest, sendEmailCode);

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
  "/resetPasswordViaPasswordToken",
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

router.post("/setHashRedis", setHashRedis);
router.post("/getHashRedis", getHashRedis);
router.post("/registerUser", registerUser);
router.post("/updateEmail", updateEmail);

export default router;
