export const formDoc = (user) => {
    return {
        ...user.toObject(),
        password:undefined,
        salt:undefined
    }
}