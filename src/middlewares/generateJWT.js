import jwt from "jsonwebtoken"

export const generateTokenAUthUser = (user)=>{
  const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "7d",
  });
  console.log(token,"------------token");
  console.log(token,"------------tokeasdadadn");
  console.log(token,"------------tokasdasdasdasden");
  console.log(token,"------------tokasdasdasdasen");
  console.log(token,"------------tokdasdasdasdasden");
  return token
};
