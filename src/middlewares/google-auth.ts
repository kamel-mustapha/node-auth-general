import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};
