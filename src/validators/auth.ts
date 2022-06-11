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
  body("email").optional().isEmail().withMessage("Email must be valid"),
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

export const userIdValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
];

export const findUsersValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
  body("input")
    .isLength({ min: 1, max: 50 })
    .withMessage("you must supply a valid full name"),
];
