import express from "express"
import { allBlogs, createBlog, deleteBlog, editBlog, singleBlog } from "../controllers/blogs.controllers.js";

const router = express.Router();

router.post("/createBlog", createBlog);
router.get("/allBlogs", allBlogs);
router.get("/singleBlog/:userId", singleBlog);
router.delete("/deleteBlog/:id", deleteBlog);
router.put("/editBlog", editBlog);

export default router;