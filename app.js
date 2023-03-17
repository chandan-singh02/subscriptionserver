import express from "express";
import { config } from "dotenv";
import courseRoutes from "./routes/CourseRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config({
  path: "./config/config.env",
});
const app = express();
app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );
app.use(cookieParser());
app.use(
  //IF WE DONT USE BECAUSE THIS SERVER WE CANT REQUEST TO ANOTHER WEBSITE
  cors({
    origin: process.env.FRONTED_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
); //otherwise we willnot send cookies
app.use("/api/v1", courseRoutes);
app.use("/api/v1", userRoutes);
export default app;
app.get("/", (req, res) => {
  res.send(
    `<h1>Site is working.click<a href=${process.env.FRONTED_URL}>here</a> to visit fronted</h1>`
  );
});
app.use(ErrorMiddleware);
