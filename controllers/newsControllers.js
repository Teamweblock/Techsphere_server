const NewsModel = require("../models/News.model");
const ErrorHander = require("../utils/errorhandaler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/Category.model");  // Assuming your Category model is located here
const { default: mongoose } = require("mongoose");

// Create News API Controller
module.exports.creatNews = catchAsyncErrors(async (req, res, next) => {
    const {
        heading,
        title,
        summery,
        content_1,
        content_2,
        content_3,
        categoryId,
        tagId,
        NewsDate,
    } = req.body;

    // File paths for uploaded images
    const heroimagePath = req.files.heroimage ? req.files.heroimage[0].path : null;
    const image2Path = req.files.image_2 ? req.files.image_2[0].path : null;
    const image3Path = req.files.image_3 ? req.files.image_3[0].path : null;

    // Prepare the News data
    const newsData = {
        heading,
        heroimage: heroimagePath,
        title,
        summery,
        content_1,
        image_2: image2Path,
        content_2,
        image_3: image3Path,
        content_3,
        Status: req.body.Status || "active",
        categoryId,
        tagId,
        NewsDate: NewsDate || new Date(),
    };

    // Save the news to the database
    const news = await NewsModel.create(newsData);

    if (!news) {
        return next(new ErrorHander("News cannot be created...", 404));
    }

    return res.status(200).json({
        success: true,
        news,
    });
});

//get all News
module.exports.getallNews = catchAsyncErrors(async (req, res) => {
    try {
        const News = await NewsModel.find();
        res.status(200).json({
            success: true,
            News,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch News" });
    }
});

//getsingleNews
module.exports.getsingleNews = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    let News = await NewsModel.findById(id);

    if (!News) {
        return next(new ErrorHander("Cannot found News..", 404));
    }
    res.status(200).json({
        success: true,
        News,
    });
});

//Delete News
module.exports.deleteNews = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    try {
        const deleteNews = await NewsModel.findByIdAndDelete(id);
        if (!deleteNews) {
            return next(new ErrorHander("News not found", 404));
        }
        return res.status(200).json({ message: "News deleted successfully" });
    } catch (err) {
        return res.status(500).json({ err });
    }
});

// Update News
module.exports.updateNews = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    const { heading, heroimage, title, summery, content_1, image_2, content_2, image_3, Status, categoryId, tagId } = req.body;
    let News = await NewsModel.findById(id);

    if (!News) {
        return next(new ErrorHander("Cannot found News..", 404));
    }
    try {
        const updatedNews = await NewsModel.findByIdAndUpdate(
            id,
            {
                heading, heroimage, title, summery, content_1, image_2, content_2, image_3, Status, categoryId, tagId,
            },
            { new: true }
        );

        if (!updatedNews) {
            return res.status(404).json({ message: "News not found" });
        }

        res.status(200).json({
            success: true,
            msg: "Updated successfully...",
            updatedNews,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update News" });
    }
});

// Get all Categories and return 6 random Categories
module.exports.HomeCategorys = catchAsyncErrors(async (req, res) => {
    try {

        // Step 1: Fetch 6 random Categories
        const randomCategories = await Category.aggregate([
            { $sample: { size: 6 } }, // Get 6 random documents
        ]);

        return res.status(200).json({
            success: true,
            // allCategories,
            randomCategories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to fetch Categories"
        });
    }
});

module.exports.CategoryWisenews = catchAsyncErrors(async (req, res, next) => {
    // const page = parseInt(req?.query?.page, 10) || 1; // Default to page 1
    // const limit = parseInt(req?.query?.limit, 10) || 10; // Default to 10 items per page
    // const skip = (page - 1) * limit;

    // Perform aggregation to get category-wise news
    const categoryWiseNews = await NewsModel.aggregate([
        {
            $lookup: {
                from: "categories", // Categories collection
                localField: "categoryId", // Field in news that links to categories
                foreignField: "_id", // Field in categories collection to match
                as: "categoryDetails", // The alias for the joined category data
            },
        },
        {
            $lookup: {
                from: "tags", // Tags collection
                localField: "tagId", // Field in news that links to tags
                foreignField: "_id", // Field in tags collection to match
                as: "tagDetails", // The alias for the joined tag data
            },
        },
        {
            $unwind: "$categoryDetails", // Unwind the categoryDetails array
        },
        {
            $unwind: "$tagDetails" // Uncomment if you need individual tags
        },
        {
            $group: {
                _id: "$categoryId", // Group by categoryId
                categoryName: { $first: "$categoryDetails.category" }, // Assuming category has a 'category' field
                // tagName: { $first: "$tagDetails.tag" }, // Uncomment if grouping by tag
                news: { $push: "$$ROOT" }, // Push all the news articles in this category
            },
        },
        {
            $sort: { categoryName: 1 }, // Optional: sort by category name
        },
        // {
        //     $skip: skip, // Skip the documents for pagination
        // },
        // {
        //     $limit: limit, // Limit the documents per page
        // },
    ]);

    // Count total categories for pagination metadata
    const totalCategories = await NewsModel.aggregate([
        {
            $group: {
                _id: "$categoryId",
            },
        },
        {
            $count: "count",
        },
    ]);

    const totalCount = totalCategories[0]?.count || 0;

    // If no news found, send an error
    if (!categoryWiseNews || categoryWiseNews.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No category-wise news found",
        });
    }

    // Send response with the aggregated data
    return res.status(200).json({
        success: true,
        // pagination: {
        //     page,
        //     limit,
        //     totalPages: Math.ceil(totalCount / limit),
        //     totalCategories: totalCount,
        // },
        categoryWiseNews,
    });
});

module.exports.CategoryWiseNewsById = catchAsyncErrors(async (req, res, next) => {
    const { categoryId } = req.body;  // Get the categoryId from the route parameters
    // const page = parseInt(req?.query?.page, 10) || 1; // Default to page 1
    // const limit = parseInt(req?.query?.limit, 10) || 10; // Default to 10 items per page
    // const skip = (page - 1) * limit;

    // Check if categoryId is provided
    if (!categoryId) {
        return res.status(400).json({
            success: false,
            message: "Category ID is required",
        });
    }
    // Convert categoryId to ObjectId if it's a valid ObjectId string
    let categoryObjectId;
    try {
        categoryObjectId = new mongoose.Types.ObjectId(categoryId);
    } catch (error) {
        console.log(error, "error");

        return res.status(400).json({
            success: false,
            message: "Invalid Category ID format",
        });
    }
    // Perform aggregation to get news for the specific category
    const categoryWiseNews = await NewsModel.aggregate([
        {
            $match: { categoryId: categoryObjectId }  // Filter news by categoryId
        },
        {
            $lookup: {
                from: "categories",      // Categories collection
                localField: "categoryId", // Field in news that links to categories
                foreignField: "_id",     // Field in categories collection to match
                as: "categoryDetails"    // The alias for the joined category data
            }
        },
        {
            $unwind: "$categoryDetails"  // Unwind the categoryDetails array
        },
        {
            $group: {
                _id: "$categoryId",                        // Group by categoryId
                categoryName: { $first: "$categoryDetails.category" }, // Assuming category has a 'name' field
                news: { $push: "$$ROOT" }                  // Push all the news articles in this category
            }
        },
        {
            $sort: { "categoryName": 1 }  // Optional: Sort by category name
        },
        // {
        //     $skip: skip, // Skip the documents for pagination
        // },
        // {
        //     $limit: limit, // Limit the documents per page
        // },
    ]);

    // If no news found for the category, send an error
    if (!categoryWiseNews || categoryWiseNews.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No news found for this category",
        });
    }

    // Send the filtered category-wise news as response
    return res.status(200).json({
        success: true,
        categoryWiseNews,
    });
});

module.exports.CategoryAndTagWiseNews = catchAsyncErrors(async (req, res, next) => {
    const { categoryId, tagId } = req.body;  // Get categoryId and tagId from query parameters
    // const page = parseInt(req?.query?.page, 10) || 1; // Default to page 1
    // const limit = parseInt(req?.query?.limit, 10) || 10; // Default to 10 items per page
    // const skip = (page - 1) * limit;

    // Check if both categoryId and tagId are provided
    if (!categoryId || !tagId) {
        return res.status(400).json({
            success: false,
            message: "Both Category ID and Tag ID are required",
        });
    }

    // Convert categoryId and tagId to ObjectId if they are valid
    let categoryObjectId, tagObjectId;
    try {
        categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        tagObjectId = new mongoose.Types.ObjectId(tagId);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid Category ID or Tag ID format",
        });
    }

    // Perform aggregation to get news for the specific category and tag
    const categoryAndTagWiseNews = await NewsModel.aggregate([
        {
            $match: {
                categoryId: categoryObjectId,  // Filter by categoryId
                tagId: tagObjectId             // Filter by tagId
            }
        },
        {
            $lookup: {
                from: "categories",      // Categories collection
                localField: "categoryId", // Field in news that links to categories
                foreignField: "_id",     // Field in categories collection to match
                as: "categoryDetails"    // The alias for the joined category data
            }
        },
        {
            $lookup: {
                from: "tags",            // Tags collection
                localField: "tagId",     // Field in news that links to tags
                foreignField: "_id",     // Field in tags collection to match
                as: "tagDetails"         // The alias for the joined tag data
            }
        },
        {
            $unwind: "$categoryDetails"  // Unwind the categoryDetails array
        },
        {
            $unwind: "$tagDetails"       // Unwind the tagDetails array
        },
        {
            $group: {
                _id: "$categoryId",                        // Group by categoryId
                categoryName: { $first: "$categoryDetails.category" },  // Assuming category has a 'name' field
                tagName: { $first: "$tagDetails.tag" },            // Assuming tag has a 'name' field
                news: { $push: "$$ROOT" }                  // Push all the news articles in this category and tag
            }
        },
        {
            $sort: { "categoryName": 1, "tagName": 1 }  // Optional: Sort by category and tag name
        },
        // {
        //     $skip: skip, // Skip the documents for pagination
        // },
        // {
        //     $limit: limit, // Limit the documents per page
        // },
    ]);

    // If no news found for the category and tag, send an error
    if (!categoryAndTagWiseNews || categoryAndTagWiseNews.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No news found for this category and tag",
        });
    }

    // Send the filtered category and tag-wise news as response
    return res.status(200).json({
        success: true,
        categoryAndTagWiseNews,
    });
});

module.exports.CategoryTagAndNewsWiseNews = catchAsyncErrors(async (req, res, next) => {
    const { categoryId, tagId, newsId } = req.body;  // Get categoryId, tagId, and newsId from req.body
    // const page = parseInt(req?.query?.page, 10) || 1; // Default to page 1
    // const limit = parseInt(req?.query?.limit, 10) || 10; // Default to 10 items per page
    // const skip = (page - 1) * limit;

    // Check if categoryId, tagId, and newsId are provided
    if (!categoryId || !tagId || !newsId) {
        return res.status(400).json({
            success: false,
            message: "Category ID, Tag ID, and News ID are required",
        });
    }

    // Convert categoryId, tagId, and newsId to ObjectId if they are valid
    let categoryObjectId, tagObjectId, newsObjectId;
    try {
        categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        tagObjectId = new mongoose.Types.ObjectId(tagId);
        newsObjectId = new mongoose.Types.ObjectId(newsId);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid Category ID, Tag ID, or News ID format",
        });
    }

    // Perform aggregation to get news for the specific category, tag, and newsId
    const categoryTagAndNewsWiseNews = await NewsModel.aggregate([
        {
            $match: {
                categoryId: categoryObjectId,  // Filter by categoryId
                tagId: tagObjectId,            // Filter by tagId
                _id: newsObjectId              // Filter by newsId (_id)
            }
        },
        {
            $lookup: {
                from: "categories",      // Categories collection
                localField: "categoryId", // Field in news that links to categories
                foreignField: "_id",     // Field in categories collection to match
                as: "categoryDetails"    // The alias for the joined category data
            }
        },
        {
            $lookup: {
                from: "tags",            // Tags collection
                localField: "tagId",     // Field in news that links to tags
                foreignField: "_id",     // Field in tags collection to match
                as: "tagDetails"         // The alias for the joined tag data
            }
        },
        {
            $unwind: "$categoryDetails"  // Unwind the categoryDetails array
        },
        {
            $unwind: "$tagDetails"       // Unwind the tagDetails array
        },
        // {
        //     $skip: skip, // Skip the documents for pagination
        // },
        // {
        //     $limit: limit, // Limit the documents per page
        // },
    ]);

    // If no news found for the category, tag, and newsId, send an error
    if (!categoryTagAndNewsWiseNews || categoryTagAndNewsWiseNews.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No news found for this category, tag, and newsId",
        });
    }

    // Send the filtered category, tag, and newsId specific news as response
    return res.status(200).json({
        success: true,
        categoryTagAndNewsWiseNews,
    });
});
