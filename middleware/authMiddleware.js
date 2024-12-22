import jwt from "jsonwebtoken"

export const authMiddleware = async(req,res,next) => {
    const headers = req.headers.authorization
    if(!headers || !headers.startsWith('Bearer')){
        return res.status(403).json({msg:"Invalid headers"});
    }
    const token = headers.split(' ')[1]
    try{
        const result = await jwt.verify(token, process.env.JWT_SECRET)
        req.body.uid = result.uid
        next()
    }
    catch(err){
        return res.status(403).json({err});
    }
}