import {User} from "#models"

export const getUsers = async() => {
    return await User.find()
}

export const getUserByEmail = async(email) => {
    return await User.findOne({email})
}

export const getUserByUsername = async(username) => {
    return await User.findOne({username})
}

export const getUserById = async(id) => {
    return await User.findById(id)
}

export const createUser = async(userData) => {
    return await User.create(userData)
}