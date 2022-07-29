import { body, check, param } from "express-validator";

export const signInValidator = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
];

export const signUpValidator = [
  body("firstName")
    .isLength({ min: 1, max: 25 })
    .withMessage("you must supply a valid first name"),
  body("lastName")
    .isLength({ min: 1, max: 25 })
    .withMessage("you must supply a valid last name"),
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
  body("code")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("you must supply Email verification code"),
];

export const updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("firstName")
    .isLength({ min: 1, max: 25 })
    .optional()
    .withMessage("you must supply a valid first name"),
  body("lastName")
    .isLength({ min: 1, max: 25 })
    .optional()
    .withMessage("you must supply a valid last name"),
  body("email").not().exists().withMessage("Invalid Input"),
  check("password").not().exists().withMessage("Invalid Input"),
];

export const updatePasswordValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
  body("newPassword")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("you must supply a valid code"),
];

export const verifyResetPasswordValidator = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("code")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("you must supply Email verification code"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 50 })
    .withMessage("you must supply a valid password"),
  body("code")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("you must supply Email verification code"),
];

export const userIdValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
];

export const findUsersValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("input")
    .isLength({ min: 1, max: 50 })
    .withMessage("you must supply a valid full name"),
];

export const phoneValidator = [
  body("id").isMongoId().withMessage("Invalid ID"),
  body("phone")
    .isMobilePhone("any")
    .withMessage("you must supply a valid phone"),
];

export const confirmPhoneValidator = [
  body("id").isMongoId().withMessage("Invalid ID"),
  body("phone")
    .isMobilePhone("any")
    .withMessage("you must supply a valid phone"),
  body("code")
    .isLength({ min: 1, max: 10 })
    .withMessage("you must supply a valid code"),
];

export const emailValidator = [
  body("email").isEmail().withMessage("you must supply a valid code"),
];
