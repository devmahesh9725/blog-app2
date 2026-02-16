import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        index: true
    },

    content: {
        type: String,
        required: true
    },

    coverImage: {
        type: String,
        default: ""
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    tags: [{
        type: String,
        lowercase: true
    }],

    category: {
        type: String,
        index: true
    },

    likesCount: {
        type: Number,
        default: 0
    },

    commentsCount: {
        type: Number,
        default: 0
    },

    views: {
        type: Number,
        default: 0
    },

    readingTime: Number,

    isPublished: {
        type: Boolean,
        default: false
    },

    publishedAt: Date

}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
