import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "password atleast should be 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        //the ID we get from Course Model
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", //this will find courseID from courseModel
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //this because in change password and regitration our hash value
  //will be change but if we are update our profile like name eamil and we dont want that our
  //hash password genrate again right beacuse we are not updtaing my passord and it generate a newly hash value
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    // expiresIN: "15d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  // console.log(this.password);
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 min token expired
  return resetToken;
};
export const User = mongoose.model("User", userSchema);
