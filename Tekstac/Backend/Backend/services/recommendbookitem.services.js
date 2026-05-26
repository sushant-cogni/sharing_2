import { RecommendBookItem } from "#models"

const getAllRecommendBooksByUserId = async(userId) => {
    return await RecommendBookItem.findOne({userId});
}

const getAllRecommendBooks = async() => {
    return await RecommendBookItem.find();
}

