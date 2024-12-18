import mongoose from "mongoose";
import Blogs from "../models/blog.model.js";


const createBlog = async (req, res) => {
    const { title, description, userId } = req.body;

    if (!title) return res.status(400).json({ message: "Title is requried" });
    if (!description) return res.status(400).json({ message: "Description is requried" });
    const user = await UserActivation.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingBlog = await Blogs.findOne({ title });
    if (existingBlog) {
        return res.status(400).json({ message: "Blog already exists" });
    }
    const blog = await Blogs.create({
        title,
        description,
        postedBy: user._id
    })
    res.status(200).json({
        message: "Blog created successfully",
        data: blog
    })
}

const singleBlog = async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid id" })
    }
    try {
        const blog = await Blogs.find({ postedBy: userId });
        if (!blog || blog.length === 0) {
            return res.status(200).json({ data: [] })
        }
        res.status(200).json({
            message: "Blog reserved",
            data: blog,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const editBlog = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const blog = await Blogs.findByIdAndUpdate({ _id: id }, { ...req.body });
    if (!blog) return res.status(404).json({ message: "Blog not found!" });
    res.status(200).json({
        message: "BLog edited successfully",
        data: blog
    })
}

const deleteBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await Blogs.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ message: "Blog not found!" })
    res.status(200).json({
        message: "Blog Delete Successfully",
        data: blog
    })
}

const allBlogs = async (req, res) => {
    const blogs = await Blogs.find({});
    res.status(200).json({
        message: "All Blogs are here",
        data: blogs
    })
}

export { createBlog, singleBlog, editBlog, allBlogs, deleteBlog, }