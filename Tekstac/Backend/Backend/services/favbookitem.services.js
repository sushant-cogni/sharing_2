import { FavBookItem } from "#models"

const getAllFavBooksByUserId = async(userId) => {
    return await FavBookItem.findOne({userId});
}

export const addToFavBooks = async(bookData) => {
    return await FavBookItem.create(bookData);
}

export const removeFromFavBooks = async(id) => {
    return await FavBookItem.deleteOneById(id);
}