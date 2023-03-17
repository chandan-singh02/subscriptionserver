import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLectures,
  addLectures,
  deleteCourse,
  deleteLecture,
} from "../controllers/courseController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

//adding lecutes only admin
router
  .route("/course/:id")
  .get(isAuthenticated, getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLectures)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);

export default router;
