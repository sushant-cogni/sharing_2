import {Book} from "#models"

export const getBooks = async() => {
    return await Book.find()
}

export const getBookByTitle = async(title) => {
    return await Book.findOne({title})
}

export const getBookByTitleAndAuthor = async(title,author) => {
    return await Book.findOne({title,author})
}

export const getBookById = async(id) => {
    return await Book.findById(id)
}

export const createBook = async(bookData) => {
    return await Book.create(bookData)
}

export const saveBook = async(bookData) => {
    return await Book.save(bookData)
}