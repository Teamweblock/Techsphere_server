const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const CategoryModel = require('../models/News.model');

module.exports.home = (req, res) => {
    return res.send('API is connected successfully! 🎉')
}

module.exports.updateCategories = catchAsyncErrors(async (req, res, next) => {
    try {
        // Extract data from the request body
        const { heroimage, image_2, image_3 } = req.body;
        console.log("req.body", req.body);


        if (!heroimage, !image_2, !image_3) {
            return res.status(400).json({
                success: false,
                message: 'Image field is required',
            });
        }

        // Step 1: Find all categories
        const categories = await CategoryModel.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No categories found',
            });
        }

        // Step 2: Map through all categories to update the necessary field
        const updatedCategories = categories.map(category => ({
            updateOne: {
                filter: { _id: category._id }, // Update by ID
                update: { heroimage, image_2, image_3 }, // Replace with the new image value
            },
        }));

        // Step 3: Use bulkWrite to perform all updates in a single call
        await CategoryModel.bulkWrite(updatedCategories);

        return res.status(200).json({
            success: true,
            message: 'Categories updated successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred',
        });
    }
});
