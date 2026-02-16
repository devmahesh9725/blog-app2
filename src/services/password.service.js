import bcrypt from "bcrypt"

export const hashedpasswordservice= async(password)=>{
    const hashedpassword = await bcrypt.hash(password , 10);
    return hashedpassword
    
}