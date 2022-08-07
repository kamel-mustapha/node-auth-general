import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import validate from "deep-email-validator";
import { findUsersPL } from "../AggPipeLines/auth";
import { BadRequestError } from "../errors";
import { User } from "../models";
import {
  PasswordHash,
  sendPhoneCode,
  verifyPhoneCode,
  TWILIO_STATUS,
  sendEmail,
} from "../services";
import client from "../services/redis";
import drive from "../services/drive";

import { confirmationEmail, resetPasswordEmail } from "../types/email";
// Get the Current User
export const currentUser = async (req: Request, res: Response) => {
  res.send({ currentUser: req.user || null });
};
// Register new User in the DB after Email Confirmation.
export const signUp = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) throw new BadRequestError("Email in use");

  const username = `${firstName}.${lastName}${Math.floor(
    100 + Math.random() * 900
  )}`;
  const user = User.build({
    firstName,
    lastName,
    username,
    email,
    password,
  });
  await user.save();

  const code = Math.floor(100000 + Math.random() * 900000);

  const options = confirmationEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  await client.setEx(email, 60 * 5, JSON.stringify(code));

  res.status(201).send(user);
};
// Login User
export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) throw new BadRequestError("Invalid credentials");

  const passwordsMatch = await PasswordHash.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) throw new BadRequestError("Invalid credentials");

  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt: userJwt,
  };
  res.status(200).send(existingUser);
};
// Sign out
export const signOut = async (req: Request, res: Response) => {
  req.session = null;
  res.send({});
};
// Verify the provided email code with the true one, and validate Account.
export const verifyAccount = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const value = await client.get(email);

  if (!value) throw new BadRequestError("Code expired");

  if (value != code) throw new BadRequestError("Wrong code");

  const user = await User.findOne({ email });

  if (!user)
    throw new BadRequestError("Couldn't find account with provided email");

  user.set({ verified: true });
  user.save();

  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt: userJwt,
  };

  res.status(201).send(user);
};
// Update some user fields.
export const updateUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  user.set(req.body);
  user.save();
  res.status(200).send(user);
};
// Update user password.
export const updateUserPassword = async (req: Request, res: Response) => {
  const { password, newPassword } = req.body;
  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new BadRequestError("Invalid credentials");
  const passwordsMatch = await PasswordHash.compare(user.password, password);
  if (!passwordsMatch) throw new BadRequestError("Invalid credentials");
  user.set({ password: newPassword });
  user.save();
  res.status(200).send({});
};
// implementing the forgot password scenario using redis.
export const forgotPasswordViaRedis = async (req: Request, res: Response) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) throw new BadRequestError("Email doesn't exist");

  const code = Math.floor(100000 + Math.random() * 900000);

  const options = resetPasswordEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  await client.setEx(email, 60 * 5, JSON.stringify(code));

  res.status(201).send({ email });
};
// implementing the reset password scenario using redis.
export const resetPasswordViaRedis = async (req: Request, res: Response) => {
  const { email, password, code } = req.body;

  const value = await client.get(email);

  if (!value) throw new BadRequestError("Code expired");

  if (value != code) throw new BadRequestError("Wrong code");

  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("Email doesn't exist");

  user.set({ password: password });

  user.save();

  res.status(200).send({ email });
};
// implementing the forgot password scenario using stored token in the DB.
export const forgotPasswordViaPasswordToken = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) throw new BadRequestError("Email doesn't exist");

  const code = Math.floor(100000 + Math.random() * 900000);

  const options = resetPasswordEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  const hashedCode = await PasswordHash.toHash(code.toString());

  const resetPasswordToken = jwt.sign(
    {
      resetCode: hashedCode,
    },
    process.env.JWT_PASSWORD_KEY!,
    {
      expiresIn: process.env.JWT_PASSWORD_DURATION!,
    }
  );

  existingUser.set({ resetPasswordToken });

  await existingUser.save();

  res.status(201).send({ email });
};
// checking the provided code using stored token in the DB.
export const verifyPasswordToken = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  return res.status(200).send({ success: true });
};
// implementing the reset password scenario using stored token in the DB.
export const resetPasswordVaiPasswordToken = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("Email doesn't exist");

  user.set({ password: password });

  await user.save();

  return res.status(200).send({ email });
};
// Getting user by its ID.
export const getUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  res.status(200).send(user);
};
// Removing user by its ID.
export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  user.remove();
  res.status(204).send({});
};
// find users by their fullNames.
export const findUsers = async (req: Request, res: Response) => {
  const users = await User.aggregate(
    findUsersPL(req.params.id, req.body.input)
  );
  if (!users) throw new BadRequestError("Invalid credentials");
  res.status(200).send(users);
};
// Sending phone code to register a valid phone number.
export const sendPhoneSMS = async (req: Request, res: Response) => {
  const { phone } = req.body;

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw new BadRequestError("Phone number in use");

  const status = await sendPhoneCode(phone);

  if (status == TWILIO_STATUS.PENDING) return res.status(201).send({ phone });
  throw new BadRequestError("Try Again");
};
// verifying the phone number.
export const confirmPhone = async (req: Request, res: Response) => {
  const { id, phone, code } = req.body;

  const user = await User.findById(id);
  if (!user) throw new BadRequestError("Invalid user");

  const status = await verifyPhoneCode(phone, code);

  if (status == TWILIO_STATUS.REJECTED)
    throw new BadRequestError("Wrong verification code");
  if (status == TWILIO_STATUS.APPROVED) {
    user.set({ phone });
    user.save();
    return res.status(200).send(user);
  }
  throw new BadRequestError("Please try later!");
};
// Sending Confirmation Code to the provided Email.
export const sendEmailCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  let result = await validate(email);

  if (!result.valid)
    throw new BadRequestError("Email is wrong or doesn't exist");

  const existingEmail = await User.findOne({ email });

  if (existingEmail) throw new BadRequestError("Email in use");

  const code = Math.floor(100000 + Math.random() * 900000);

  const options = confirmationEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  await client.setEx(email, 60 * 5, JSON.stringify(code));

  res.status(201).send({ email });
};
export const updateEmail = async (req: Request, res: Response) => {
  const { id, email, code } = req.body;

  const value = await client.get(email);

  if (!value) throw new BadRequestError("Code expired");

  if (value != code) throw new BadRequestError("Wrong code");

  const user = await User.findById(id);

  if (!user)
    throw new BadRequestError("Couldn't find account with provided email");

  user.set({ email });
  user.save();

  res.status(201).send({ email });
};
// test Redis storing key values.
export const storeValue = async (req: Request, res: Response) => {
  const { id, value } = req.body;
  await client.setEx(id, 60 * 5, JSON.stringify(value));
  res.status(201).send({ value });
};
// retrieve the value of specific Key.
export const retrieveValue = async (req: Request, res: Response) => {
  const { id } = req.body;
  const value = await client.get(id);
  const timeLeft = await client.ttl(id);
  res.status(201).send({ value, timeLeft });
};
// Uploading Profile pictures using Multer to Google Drive directly.
export const uploadProfilePictureToDrive = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) throw new BadRequestError("no user found");

  if (!req.file) throw new BadRequestError("No file selected!");

  const file = req.file as Express.Multer.File;

  if (!file.mimetype.startsWith("image"))
    throw new BadRequestError("Only images allowed!");

  if (file.size > 1000000) throw new BadRequestError("Only 1MB");

  try {
    const picture = user.picture.split("/d/")[1];

    if (picture != process.env.DEFAULT_PICTURE) {
      const response = await drive.updateFile(file, user.id, picture);

      if (!response) throw new BadRequestError("Server Error, try later");

      await user.save();
    } else {
      const response = await drive.uploadFile(file, user.id);

      if (!response) throw new BadRequestError("Server Error, try later");

      user.picture = `${process.env.GOOGLE_PHOTOS_URL}${response.id}`;

      await user.save();
    }

    res.status(200).send(user);
  } catch (error: any) {
    res.send({ errors: error.message });
  }
};
// Check whether username exist or not.
export const checkUsernameExistence = async (req: Request, res: Response) => {
  const { username } = req.body;
  const exist = await User.exists({ username });
  if (exist) throw new BadRequestError("Username is already used");
  res.status(200).send({ success: true });
};
// Check whether Email exist or not.
export const checkEmailExistence = async (req: Request, res: Response) => {
  const { email } = req.body;
  const exist = await User.exists({ email });
  console.log("result:", exist);
  if (exist) throw new BadRequestError("Email is already used");
  res.status(200).send({ success: true });
};
// Check whether Phone Number exist or not.
export const checkPhoneExistence = async (req: Request, res: Response) => {
  const { phone } = req.body;
  const exist = await User.exists({ phone });
  if (exist) throw new BadRequestError("Phone is already used");
  res.status(200).send({ success: true });
};

export const setHashRedis = async (req: Request, res: Response) => {
  const { userName, firstName, lastName, email, password } = req.body;
  // await client.setEx(email, 60 * 5, JSON.stringify(code));
  await client.hSet(email, req.body);
  await client.expire(email, 60 * 60 * 24 * 3);
  res.status(200).send({});
};
export const getHashRedis = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await client.hGetAll(email);
  console.log(result);
  console.log(result.userName);
  res.status(200).send(result);
};

export const registerUser = async (req: Request, res: Response) => {
  const { username, firstName, lastName, email, password } = req.body;
  const user = User.build({
    firstName,
    lastName,
    username,
    email,
    password,
  });
  await user.save();
  res.status(200).send(user);
};
