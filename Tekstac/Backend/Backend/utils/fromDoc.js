export const userDoc = (obj,accessToken) => {
    return {
        username:obj.username,
        email:obj.email,
        password:undefined,
        id:obj._id,
        accessToken
    }
}

export const bookDoc = (obj) => {
    return {
        id:obj._id,
        ...obj,
        _id:undefined,
    }
}