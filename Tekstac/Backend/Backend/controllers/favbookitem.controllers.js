import { apiErrors } from "#errors"
import { favBookServices } from "#services";

export const getFavBooksById = async(req,res) => {
    try{
        const {userId} = req.body;

        const books = await favBookServices.getFavBooksById(userId);

        return res.status(204).json(books)
    }catch(err){
        return apiErrors(err.message,res,400)
    }
}

export const addToFavBooks = async(req,res) => {
    try{
        const favBook = req.body;

        const book = await favBookServices.addToFavBooks(favBook);

        return res.status(204).json(book)
    }catch(err){
        return apiErrors(err.message,res,400)
    }
}


export const removeFavBooks = async(req,res) => {
    try{
        const {id} = req.body;

        const book = await favBookServices.removeFromFavBooks(id);

        return res.status(204).json(book)
    }catch(err){
        return apiErrors(err.message,res,400)
    }
}