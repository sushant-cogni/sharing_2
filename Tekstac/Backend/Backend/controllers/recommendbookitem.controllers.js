import { apiErrors } from "#errors"
import { recommendBookServices } from "#services";

export const getRecommendBooksById = async(req,res) => {
    try{
        const {userId} = req.body;

        const books = await recommendBookServices.getAllRecommendBooksByUserId(userId)

        return res.status(204).json(books)
    }catch(err){
        return apiErrors(err.message,res,400)
    }
}

export const getRecommendBooks = async(req,res) => {
    try{
        
        const books = await recommendBookServices.getAllRecommendBooks()

        return res.status(204).json(books)
    }catch(err){
        return apiErrors(err.message,res,400)
    }
}