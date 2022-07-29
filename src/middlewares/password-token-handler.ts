import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { BadRequestError } from "../errors";

interface Payload {
  resetCode: number;
}

export const passwordTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email }).select("+resetPasswordToken");

  if (!user) throw new BadRequestError("Email doesn't exist");

  try {
    const payload = jwt.verify(
      user.resetPasswordToken,
      process.env.JWT_PASSWORD_KEY!
    ) as Payload;
    if (payload.resetCode === code) return next();

    throw new BadRequestError("Wrong or expired Code!");
  } catch (error) {
    throw new BadRequestError("Wrong or expired Code!");
  }
};
