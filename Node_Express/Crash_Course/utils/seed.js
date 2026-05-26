const mongoose = require("mongoose")
const dotenv=require("dotenv")
const { connectDB } = require("../config/db")
const Movie = require("../models/Movie.js")
const User = require("../models/User.js")

dotenv.config()


const mockMovies = [
  {
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology.",
    year: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    creator:"Nolan"
  },
  {
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.",
    year: 2008,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
  }
];

const mockUser={
  "name":"Demo",
  "email":"demo@email.com",
  "password":"123"
}

const seed = async() =>{
    try{

      
        console.log("Connecting to database...");
        await connectDB()

        const isMoviesAvailable= await Movie.countDocuments();
        
        if(isMoviesAvailable>0){
            console.log("Mock Movies already exists")
            process.exit(0)
        }

        console.log("Movies seeding started")

        let defaultUser=await User.findOne()

        if(!defaultUser){
          defaultUser=await User.create(mockUser)
        }

        for(movieData of mockMovies){
            movieData.addedBy=defaultUser._id
            await Movie.create(movieData)
            console.log(`Created movie: ${movieData.title}`);
        }

        console.log("Movies Successfully seeded")
        process.exit(0)
    }catch(error){
        console.log("error : ", error.message)
        process.exit(1)
    }
}

seed()