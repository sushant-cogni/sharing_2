const {z} = require("zod")

const WatchListValidationSchema= z.object({

    movie: z.string().length(24, { message: "Invalid movie ID format" }),
  
    status: z.enum(['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED'], {
        errorMap: () => ({ message: "Status must be PLANNED, WATCHING, COMPLETED, or DROPPED" })
    }).optional(),
    
    rating: z.coerce.number().int().min(1).max(10, {
        message: "Rating must be an integer between 1 and 10"
    }).optional(),
    
    notes: z.string().optional()

})

module.exports = WatchListValidationSchema
