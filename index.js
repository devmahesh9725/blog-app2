import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser";
import UserRoutes from "./src/routes/user.routes.js"
// import postRoutes from "./src/routes/post.routes.js"

const app=express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended : true}));

const dbConnection = ()=>{
    mongoose.connect(process.env.DB_URL).then(console.log("Mongo DB Connected Succesfully ====>"))
    .catch((error)=> {console.log("Error connection DB ======>",error)} );
}

dbConnection();
app.get("/" , (_,res)=>{
    res.send("Everything is Working Properly ------------- >>>")
})

app.use(cookieParser());
app.use("/user" ,UserRoutes);
app.get("/docker" , (req,res)=>{
    res.send("Hello docker is running..............===>");
})
// app.use("/post",postRoutes)

const PORT = process.env.PORT || 4500;

app.listen(PORT  ,()=>{
    console.log("Server is running on PORT ------> ", PORT);
}
)
