import { blogController } from "#controllers"
import { Blog } from "#models"
import { blogServices } from "#services"
import { validateToken } from "#utils"

export const Authenticate = async(req,res,next) => {

    const token = req.cookies.token

    if(!token)
        return next()

    try{
        const payload = validateToken(token)

        if(payload)
            req.user=payload
    }catch(err){}

    return next()

}

export const requiredLogin = async(req,res,next) =>{
    if(!req.user) 
        return res.redirect("/signin")
    return next()
}

export const authorizeToRemove = async(req,res,next) =>{
    try {
        const blog = await blogServices.getBlogById(req.params.id)

        if(blog.createdBy._id.toString() === req.user._id.toString()){
            // console.log("Authorized")
           return next()
        }
        else {
            // console.log("Unauthorized")
            return res.redirect("/")
        }
    } catch (error) {}
}