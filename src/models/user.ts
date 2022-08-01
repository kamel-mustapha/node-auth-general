import mongoose from "mongoose";
import { PasswordHash } from "../services/hash-password";

interface UserAttrs {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  googleId?: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document<any> {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  resetPasswordToken: string;
  googleId: string;
  picture: String;
  thumbnail: String;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [1, "first name must be more then 1 character"],
      maxLength: [25, "first name can not be more than 25 characters"],
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [1, "last name must be more then 1 character"],
      maxLength: [25, "last name can not be more than 25 characters"],
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      minlength: [6, "Username must be more than 5 characters"],
      maxLength: [25, "Username can not be more than 25 characters"],
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
    },
    picture: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.fullName = { firstName: ret.firstName, lastName: ret.lastName };
        delete ret._id;
        delete ret.firstName;
        delete ret.lastName;
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await PasswordHash.toHash(this.get("password"));
    this.set("password", hashed);
  }
});

userSchema
  .virtual("fullName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (v) {
    // `v` is the value being set, so use the value to set
    // `firstName` and `lastName`.
    const firstName = v.substring(0, v.indexOf(" "));
    const lastName = v.substring(v.indexOf(" ") + 1);
    this.set({ firstName, lastName });
    console.log("hello world here");
  });

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
