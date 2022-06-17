import { Request, Response } from "express";
import jwt from "jsonwebtoken";
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

import { confirmationEmail } from "../types/email";

import client from "../services/redis";

export const currentUser = async (req: Request, res: Response) => {
  res.send({ currentUser: req.user || null });
};

export const signUp = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new BadRequestError("Email in use");
  const user = User.build({
    firstName,
    lastName,
    email,
    password,
  });
  await user.save();
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

export const signOut = async (req: Request, res: Response) => {
  req.session = null;
  res.send({});
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  user.set(req.body);
  user.save();
  res.status(200).send(user);
};

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

export const getUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  res.status(200).send(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError("Invalid credentials");
  user.remove();
  res.status(204).send({});
};

export const findUsers = async (req: Request, res: Response) => {
  const users = await User.aggregate(
    findUsersPL(req.params.id, req.body.input)
  );
  if (!users) throw new BadRequestError("Invalid credentials");
  res.status(200).send(users);
};

export const sendPhoneSMS = async (req: Request, res: Response) => {
  const { phone } = req.body;

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw new BadRequestError("Phone number in use");

  const status = await sendPhoneCode(phone);

  if (status == TWILIO_STATUS.PENDING) return res.status(201).send({ phone });
  throw new BadRequestError("Try Again");
};

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

export const sendEmailCode = async (req: Request, res: Response) => {
  const { id, email } = req.body;

  const existingEmail = await User.findOne({ email });

  if (existingEmail) throw new BadRequestError("Email in use");

  const code = Math.floor(100000 + Math.random() * 900000);

  const options = confirmationEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  await client.setEx(email, 60 * 5, JSON.stringify(code));

  res.status(201).send({ email });
};

export const confirmEmail = async (req: Request, res: Response) => {
  const { id, email, code } = req.body;

  const value = await client.get(email);

  if (!value) throw new BadRequestError("Code expired");

  if (value != code) throw new BadRequestError("Wrong code");

  const user = await User.findById(id);

  if (!user) throw new BadRequestError("Wrong user ID");

  user.set({ email });
  user.save();
  res.status(201).send(user);
};
