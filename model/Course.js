import mongoose from "mongoose";

const userCourse = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter a course title"],
    minLength: [4, "Title must be atleast 4 characters"],
    maxLength: [80, "Title can  exceed 80 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter a course title"],
    minLength: [24, "description must be atleast 24 characters"],
  },

  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],

  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Enter a course creator name"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Course = mongoose.model("Course", userCourse);
