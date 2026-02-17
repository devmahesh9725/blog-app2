import jwt from "jsonwebtoken"

export const generateTokenAUthUser = (user)=>{
  const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "7d",
  });
  console.log(token,"------------token");
  console.log(token,"------------token");
  console.log(token,"------------token");
  console.log(token,"------------token");
 
  return token
};
