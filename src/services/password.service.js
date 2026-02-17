import bcrypt from "bcrypt"

export const hashedpasswordservice= async(password)=>{
    const hashedpassword = await bcrypt.hash(password , 10);
    console.log("Paswrod has been hashed :  : : :  :: :")
    return hashedpassword
    
}