import { Router } from "express"
import { registerUser, loginUser } from "../controllers/user.controller.js";
import createBlog from "../controllers/post.controller.js"

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/createBlog",createBlog) 


export default router