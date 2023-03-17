import express from "express";

import {
  addToPlaylist,
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetpassword,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js"; //mandotiry if not use will get undefined name email and file password

const router = express.Router();

router.route("/register").post(singleUpload, register);
// router.route("/users").get(getAllUsers);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/changepassword").post(isAuthenticated, changePassword);
router.route("/updateprofile").put(isAuthenticated, updateProfile);

router
  .route("/changeprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);

router.route("/forgetpassword").post(forgetPassword);

router.route("/resetpassword/:token").put(resetpassword);

router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser);

router.route("/me").delete(isAuthenticated, deleteMyProfile);
export default router;
