import mongoose from "mongoose";

export const findUsersPL = (id: string, input: string) => [
  {
    $project: {
      result: {
        $concat: ["$firstName", " ", "$lastName"],
      },
      id: "$_id",
      fullName: {
        firstName: "$firstName",
        lastName: "$lastName",
      },
      email: 1,
    },
  },
  {
    $match: {
      result: {
        $regex: ".*" + input + ".*",
      },
      _id: {
        $ne: new mongoose.Types.ObjectId(id),
      },
    },
  },
];
