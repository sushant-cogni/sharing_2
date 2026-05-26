const bcrypt  = require("bcryptjs")


const encrypt = async(value) => {
    salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(value,salt)
}

const compare = async(value, compareTo) =>{
    return await bcrypt.compare(value,compareTo)
}

module.exports={
    encrypt,
    compare
}