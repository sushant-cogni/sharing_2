import {apiErrors} from "#errors";
import { bookServices } from "#services";
import { bookDoc } from "#utils";


export const createBook = async(req,res) =>{
    try{
        const body = req.body;

        const exists = await bookServices.getBookByTitleAndAuthor(body.title,body.author);

        if(exists){
            return apiErrors("Book already exists !",res,400);
        }

        const book = bookServices.createBook({
            ...body
        })

        res.status(201).send(bookDoc(book)) 

    }catch(err){
        apiErrors(err.message,res,400)
    }
}

// export const getAllBooks = async(req,res) => {
//     try{
//         const body = req.body;

//         const category = body.category
//         const skip = 
//     }catch(err){
//         apiErrors(err.message,res,400)
//     }
// }