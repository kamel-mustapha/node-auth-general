import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors";
import { User } from "../models";
import { PasswordHash } from "../services";

export const currentUser = async (req: Request, res: Response) => {
  res.send({currentUser: req.user || null});
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

  const existingUser = await User.findOne({ email });

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
