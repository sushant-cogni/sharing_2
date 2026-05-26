import bcrypt from "bcryptjs"

export const hash = async(data) => {
    return  await bcrypt.hash(data,Number(process.env.SALT))
}

export const compareHash = async(data,hashedData) => {
    return await bcrypt.compare(data,hashedData)
}