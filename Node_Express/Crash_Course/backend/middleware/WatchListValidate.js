

const WatchListValidate = (schema) => {

    return (req,res,next) => {
        const result= schema.safeParse(req.body)

        if(!result.success){
            const error= result.error.flatten().fieldsErrors

            return res.status(400).json({
                message:"Validation failed",
                errors: error
            })
        }

        console.log("Validated successfully\n")

        next()
    }

}

module.exports = WatchListValidate
