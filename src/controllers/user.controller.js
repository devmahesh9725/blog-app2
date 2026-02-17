import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { registerUserService } from "../services/User.service.js";
import {generateTokenAUthUser} from "../middlewares/generateJWT.js";

export const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !username || !password) {
      return res.status(401).json({
        message: "Incomplete Payload",
        success: false,
      });
    }
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(403).json({
        message: "Email Already Exist Please try another one",
        sucess: false,
      });
    }
    const existUserName = await User.findOne({ username });
    if (existUserName) {
      return res.status(403).json({
        message: "Username Already Registered",
        success: false,
      });
    }
    const user = await registerUserService(email, username, password);
    console.log("User Registred Successfully :>", user);

    return res.status(200).json({
      message: "User Registered Successfully ✅",
      success: true,
    });
  } catch (error) {
    console.log("Error Registering User ------>", error);
    return res.status(500).json({
      message: "Error Occured in registering user :-->",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email , password);
    if (!email || !password) {
      console.log("email and password are required >>>>>>>>>>> ")
      return res.status(403).json({
        message: "Invalid Credentials",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "Invalid Credentials",
      });
    }
    console.log(user, "--------user");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Invalid credentails",
        success: false,
      });
    }
    console.log(isMatch, "---------Password");
    const token = generateTokenAUthUser(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.password = undefined;
    console.log("done done testing the code ")
    return res.status(200).json({
      success: true,
      message: "Login successful ✅",
      user,
    });
  } catch (error) {
    console.log("Error Login The User");
    res.status(500).json({
      message: "Error Login User",
      success: false,
    });
  }
};
