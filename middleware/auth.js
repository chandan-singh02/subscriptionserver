import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies; //The function first extracts the JWT token from the req.cookies object

  ///The function first extracts the JWT token from the req.cookies object.
  // If no token is found, the function calls the next function with an error
  //  object, created using the ErrorHandler class and a status code of 401(Unauthorized).
  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  //If a token is found, the function uses the jwt.verify()
  // method to decode the token using the secret stored in the process.
  //env.JWT_SECRET environment variable.The decoded token contains the user ID,
  // which is then used to find the user in the database using the User.findById() method.The user object is then attached to the req object as req.user.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded._id); //The user object is then attached to the req object as req.user.
  next();
});

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role != "admin")
    return next(
      new ErrorHandler(`${req.user.role}is not allowed to access this resource`)
    );
  next();
};
