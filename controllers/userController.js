// export const getAllUsers = (req, res) => {
//   res.send("Working users");
// };
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { Course } from "../model/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter all fields", 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User Already Exist", 400));

  // console.log(file);
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  // res.status(201).cookie("token",)
  sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));

  sendToken(res, user, `welcome Back!,${user.name}`, 201);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    messsage: "Password Change Sucessfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();

  res.status(200).json({
    success: true,
    messsage: "Profile Updated Succesfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  // console.log(file);

  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Pofile Picture Updated Sucessfully",
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = await user.getResetToken();
  const url = `${process.env.FRONTED_URL}/resetpassword/${resetToken}`;

  await user.save();
  const message = `Click on the link to reset your password.${url}.If you have not request then please ignore`;

  await sendEmail(user.email, "Ultimate Guide Reset Password", message);
  res.status(200).json({
    success: true,
    message: `Reset Token Has Been sent to ${user.email}`,
  });
});

export const resetpassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has beem expired", 401));

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password change successfully",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id); //id it is authenticated
  // console.log(user);
  const course = await Course.findById(req.body.id);
  // console.log(".......................");
  // console.log(course);
  if (!course) return next(new ErrorHandler("Invalid Course ID", 404));
  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added To Playlist",
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id); //not req.body.id
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed From Playlist",
  });
});

////ADMIN CONTROL
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  // await user.save();
  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }
  await user.save();
  // await user.save();
  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.remove();
  // await user.save();
  res.status(200).json({
    success: true,
    message: "User deleted sucessfully",
  });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.remove();
  // await user.save();
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User deleted sucessfully",
    });
});
