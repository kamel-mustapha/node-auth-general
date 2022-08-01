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
  forgotPasswordVaiPasswordToken,
  verifyPasswordToken,
  resetPasswordVaiPasswordToken,
  uploadPicture,
  uploadProfilePictureToDrive,
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
  uploadPictureValidator,
} from "../validators/auth";
import {
  requireAuth,
  validateRequest,
  passwordTokenHandler,
} from "../middlewares";
import passport from "passport";
import validate from "deep-email-validator";

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

router.get("/require", requireAuth, (req, res) => {
  console.log("you are here");
  res.send("you are authorized");
});

router.post(
  "/forgotPasswordVaiPasswordToken",
  forgotPasswordValidator,
  validateRequest,
  forgotPasswordVaiPasswordToken
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

router.post("/uploadFile", uploadPicture);
router.post(
  "/uploadProfilePicture/:id",
  upload.single("file"),
  uploadPictureValidator,
  validateRequest,
  uploadProfilePictureToDrive
);

export default router;
