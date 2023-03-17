import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Course } from "../model/Course.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
//asycn await for performing a asynchronous task because we dont know how much time awat Course.find()function takes
//till the course find, the remaining or below code will not executed even res.status will not exeucted
//meanwhile the outside of the getallcourse function will be continuing exeuted

//get all courses without lectures
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";
  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }).select("-lectures"); //so becuse of await the function will freeze till the data get
  res.status(200).json({
    success: true,
    courses,
  });
});

//create new course --only admin
export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  const file = req.file;
  // console.log(file);
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  // console.log(fileUri.content);

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please add all the fields", 400));
  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "courses created Successfully",
  });
});

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  // console.log(course);
  if (!course) return next(new ErrorHandler("Course not found", 404));
  course.views += 1;

  await course.save();
  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

export const addLectures = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const course = await Course.findById(id);
  // console.log(course);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const file = req.file;
  // console.log(file);
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  course.lectures.push({
    title,
    description,
    video: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  course.numOfVideos = course.lectures.length;
  await course.save();
  res.status(200).json({
    success: true,
    message: "Lectures added in Course",
  });
});

export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  // console.log(course);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
    console.log(singleLecture.video.public_id);
  }

  await course.remove();
  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  const course = await Course.findById(courseId);
  // console.log(course);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });
  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });
  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });
  course.numOfVideos = course.lectures.length;
  await course.save();
  res.status(200).json({
    success: true,
    message: "Lecture deleted successfully",
  });
});
