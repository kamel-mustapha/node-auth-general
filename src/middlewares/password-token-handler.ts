import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { PasswordHash } from "../services";
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

    const codeMatch = await PasswordHash.compare(
      payload.resetCode.toString(),
      code.toString()
    );
    if (!codeMatch) throw new BadRequestError("Wrong Code!");
    return next();
  } catch (error) {
    throw new BadRequestError("Wrong or expired Code!");
  }
};
