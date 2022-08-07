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
  verifyAccountViaCode,
  updateEmail,
  verifyAccountViaToken,
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
  resetPasswordValidator,
  emailCodeValidator,
  phoneNumberValidator,
  usernameValidator,
  confirmEmailValidator,
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
router.post(
  "/verifyAccountViaCode",
  emailCodeValidator,
  validateRequest,
  verifyAccountViaCode
);
router.get("/verifyAccountViaToken/:token", verifyAccountViaToken);

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
  emailValidator,
  validateRequest,
  forgotPasswordViaRedis
);
router.post(
  "/resetPasswordViaRedis",
  resetPasswordValidator,
  validateRequest,
  resetPasswordViaRedis
);

router.post(
  "/sendEmailCode",
  requireAuth,
  emailValidator,
  validateRequest,
  sendEmailCode
);
router.put(
  "/updateEmail",
  requireAuth,
  confirmEmailValidator,
  validateRequest,
  updateEmail
);

router.post("/sendPhoneCode", phoneValidator, validateRequest, sendPhoneSMS);
router.post(
  "/confirmPhone",
  confirmPhoneValidator,
  validateRequest,
  confirmPhone
);

router.post(
  "/forgotPasswordViaPasswordToken",
  emailValidator,
  validateRequest,
  forgotPasswordViaPasswordToken
);
router.post(
  "/verifyPasswordToken",
  emailCodeValidator,
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
// ----------------Test Functions------------------//
router.post("/storeValue", storeValue);
router.post("/retrieveValue", retrieveValue);

router.post("/setHashRedis", setHashRedis);
router.post("/getHashRedis", getHashRedis);
router.post("/registerUser", registerUser);
// ------------------------------------------------//
export default router;
