import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true
    },
    descriptions: { // Changed from description to content
        type: String,
        required: [true, "Descriptions is required"],
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: "User ", // Ensure this matches the User model name
        required: true,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export default mongoose.model("Blog", blogSchema); // Changed model name to singular