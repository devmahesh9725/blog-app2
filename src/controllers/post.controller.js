


export const createPost = (req,res)=>{
    const {title , description} = req.body
    if(!title || !description){
        return res.status(403).json({
            message : "Enter Sufficient data for the post",
        })
    }
    const 
}