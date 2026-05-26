import {User} from "#models"

export const saveUser = async(data) => {

    const {name, email, password} = data

    return await User.create({
        name,
        email,
        password
    })
}  

export const findUserByEmail = async(email) => {
    return await User.findOne({email})
}

