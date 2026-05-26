import { blogServices } from "#services"

export const addBlogPage = (req, res) => {
    return res.render("addBlog", { user: req.user })
}

export const addBlog = async(req,res) =>{
    
    try{
        const {title,body} = req.body

        const blog= await blogServices.createBlog({
            title,
            body,
            coverImageURL: `/uploads/${req.file.filename}`,
            createdBy:req.user._id
        })

        return res.redirect(`/blog/${blog._id}`)
    }catch(err){
        console.log(err)
        return res.status(500).json({message:err.message})
    }
}

export const viewBlog = async(req,res) =>{

    try{
        const blog = await blogServices.getBlogById(req.params.id)
        const comments = await blogServices.getCommentsById(req.params.id)
        // console.log(blog)
        return res.render("blog",{
            user:req.user,
            blog,
            comments
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({message:err.message})
    }

}

export const createComment = async(req,res) =>{
    try {

        // console.log("blog route reached : \n",req.body,"\n",req.params.id,"\n",req.user._id)
        const comment = await blogServices.createComment({
            content:req.body.content,
            blogId:req.params.id,
            commentedBy:req.user._id
        })

        // console.log(`moving to blog/${req.params.id}`)
        return res.redirect(`/blog/${req.params.id}`)
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:err.message})
    }
}

export const deleteBlog = async(req,res) =>{

    try {
        console.log(req.params.id)
        
        const blog = await blogServices.deleteBlogById(req.params.id)

        // console.log("Deleted",blog)
        return res.redirect("/")
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:err.message})
    }

}