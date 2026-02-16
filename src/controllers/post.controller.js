import Blog from "./models/Blog.js"; // Adjust path as needed
import mongoose from "mongoose";

// Utility function to calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Utility function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      coverImage,
      tags,
      category,
      isPublished,
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Check if slug already exists and make it unique
    let existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    // Create blog post
    const blog = await Blog.create({
      title,
      slug,
      content,
      coverImage: coverImage || "",
      author: req.user._id, // Assuming user ID comes from auth middleware
      tags: tags || [],
      category: category || "",
      readingTime,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    // Populate author details
    await blog.populate("author", "name email");

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message,
    });
  }
};

// @desc    Get all blog posts (with filters and pagination)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      isPublished,
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",") };
    if (author) query.author = author;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Blog.countDocuments(query);

    // Fetch blogs
    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBlogs: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
      error: error.message,
    });
  }
};

// @desc    Get single blog post by ID or slug
// @route   GET /api/blogs/:identifier
// @access  Public
export const getBlogById = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is a valid ObjectId or slug
    let blog;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      blog = await Blog.findById(identifier).populate("author", "name email");
    } else {
      blog = await Blog.findOne({ slug: identifier }).populate(
        "author",
        "name email"
      );
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
      error: error.message,
    });
  }
};

// @desc    Get all blogs by current user
// @route   GET /api/blogs/my-posts
// @access  Private
export const getMyBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments({ author: req.user._id });

    const blogs = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBlogs: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your blog posts",
      error: error.message,
    });
  }
};

// @desc    Update blog post by ID
// @route   PUT /api/blogs/:id
// @access  Private (Author only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      coverImage,
      tags,
      category,
      isPublished,
    } = req.body;

    // Find blog post
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this blog post",
      });
    }

    // Update fields
    if (title) {
      blog.title = title;
      blog.slug = generateSlug(title);
      
      // Ensure slug uniqueness (excluding current blog)
      const existingBlog = await Blog.findOne({
        slug: blog.slug,
        _id: { $ne: id },
      });
      if (existingBlog) {
        blog.slug = `${blog.slug}-${Date.now()}`;
      }
    }

    if (content) {
      blog.content = content;
      blog.readingTime = calculateReadingTime(content);
    }

    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (tags) blog.tags = tags;
    if (category !== undefined) blog.category = category;

    // Handle publishing status
    if (isPublished !== undefined) {
      blog.isPublished = isPublished;
      if (isPublished && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();
    await blog.populate("author", "name email");

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message,
    });
  }
};

// @desc    Delete blog post by ID
// @route   DELETE /api/blogs/:id
// @access  Private (Author only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog post
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog post",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message,
    });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/blogs/:id/publish
// @access  Private (Author only)
export const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this blog post",
      });
    }

    blog.isPublished = !blog.isPublished;
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog post ${blog.isPublished ? "published" : "unpublished"} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error("Error toggling publish status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle publish status",
      error: error.message,
    });
  }
};

// @desc    Increment likes count
// @route   POST /api/blogs/:id/like
// @access  Private
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    ).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog liked successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like blog post",
      error: error.message,
    });
  }
};