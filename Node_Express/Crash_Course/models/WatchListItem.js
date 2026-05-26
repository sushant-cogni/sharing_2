// ==========================================
// 2. MONGOOSE SCHEMA & MODEL DEFINITION
// ==========================================

const mongoose = require("mongoose");

// mongoose.Schema defines the structure, data types, and rules for a document
// (a single entry) inside a MongoDB collection.
const WatchListItemSchema = mongoose.Schema(
  {
    // 1. RELATIONAL DATA (Linking tables/collections)
    user: {
      // 'ObjectId' is a special data type in MongoDB. It's the unique string
      // of letters and numbers generated for every document (like "_id: 64a...").
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // 'ref' tells Mongoose: "This ObjectId belongs to the 'User' model."
      // This acts like a Foreign Key in SQL. Later, you can use the .populate()
      // method to automatically fetch the user's actual data (name, email)
      // using just this ID!
      ref: "User",
    },

    // Same concept as above. We are linking this watchlist item to a specific Movie.
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Movie",
    },

    // 2. ENUMS (Restricted Values)
    status: {
      type: String,
      // 'enum' is a validator. It means the 'status' string CANNOT be anything
      // other than these four exact words. If a user tries to send status: "LIKED",
      // Mongoose will throw an error and block the save.
      enum: ["PLANNED", "WATCHING", "COMPLETED", "DROPPED"],
      // If the user doesn't provide a status when creating this item, Mongoose
      // automatically fills it in with 'PLANNED'.
      default: "PLANNED",
    },

    // 3. OPTIONAL FIELDS
    rating: {
      type: Number, // e.g., 8.5
    },
    notes: {
      type: String, // e.g., "The ending was confusing."
    },
  },
  {
    // 4. SCHEMA OPTIONS
    // Setting 'timestamps: true' is a massive time-saver. Mongoose will
    // automatically add 'createdAt' and 'updatedAt' fields to your document,
    // and it will update 'updatedAt' every time you change the document.
    timestamps: true,
  },
);

// ==========================================
// 3. EXPORTING THE MODEL
// ==========================================

// NOTE: You used 'export default' here, which is ES6 Module syntax, but you
// used 'require' at the top, which is CommonJS. Node will throw an error
// mixing them. I am changing this to CommonJS 'module.exports' to match
// the rest of your app!

// mongoose.model compiles your Schema blueprint into a usable Model.
// Argument 1: The singular name of the collection ("WatchListItem"). Mongoose
// will automatically lowercase and pluralize this in the database ("watchlistitems").
// Argument 2: The schema to use.
// module.exports = mongoose.model("WatchListItem", WatchListItemSchema)
module.exports = mongoose.model("WatchListItem", WatchListItemSchema);
