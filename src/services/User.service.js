import User from "../models/user.model.js";
import {hashedpasswordservice} from "./password.service.js"

export const registerUserService = async(username,email,password)=>{
    const hashedpassword = await hashedpasswordservice(password)
    const user = await User.create({
        username: username,
        email: email,
        password: hashedpassword,
    });
    console.log("user have been registerd succesfully  ::::   ::  very good'")
    return user
}