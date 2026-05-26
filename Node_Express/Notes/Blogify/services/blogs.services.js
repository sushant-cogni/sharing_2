import { Blog, Comment } from "#models"

export const createBlog = async (data) => {
    return await Blog.create(data)
}

export const getAllBlogs = async () => {
    return await Blog.find({}).sort({ createdAt: -1 })
}

export const getBlogById = async (id) => {
    return await Blog.findById(id).populate("createdBy")
}

export const createComment = async(data) => {
    return await Comment.create(data)
}

export const getCommentsById = async(blogId) =>{
    return await Comment.find({blogId}).populate("commentedBy")
}

export const deleteBlogById = async(_id) =>{
    return await Blog.deleteOne({_id})
}