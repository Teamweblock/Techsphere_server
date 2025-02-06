const TagModel = require("../models/Tag.model");
const ErrorHander = require("../utils/errorhandaler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create Tags
module.exports.creatTag = catchAsyncErrors(async (req, res, next) => {
    // const { tag, Status } = req.body;
    const Tags = await TagModel.insertMany(
        req.body
    );
    if (!Tags) {
        return next(new ErrorHander("Tags cannot be created...", 404));
    }
    return res.status(200).json({
        success: true,
        Tags,
    });
});

//get all Tags
module.exports.getallTags = catchAsyncErrors(async (req, res) => {
    try {
        const Tags = await TagModel.find();
        res.status(200).json({
            success: true,
            Tags,
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch Tags" });
    }
});

//getsingleTags
module.exports.getsingleTags = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    let Tag = await TagModel.findById(id);

    if (!Tag) {
        return next(new ErrorHander("Cannot found Tags..", 404));
    }
    return res.status(200).json({
        success: true,
        Tag,
    });
});

//Delete Tag
module.exports.deleteTag = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    try {
        const deleteTag = await TagModel.findByIdAndDelete(id);
        if (!deleteTag) {
            return next(new ErrorHander("Tags not found", 404));
        }
        return res.status(200).json({ message: "Tags deleted successfully" });
    } catch (err) {
        return res.status(500).json({ err });
    }
});

// Update Tag
module.exports.updateTags = catchAsyncErrors(async (req, res, next) => {
    let id = req.query.id;
    const { tag, Status } = req.body;
    let Tag = await TagModel.findById(id);

    if (!Tag) {
        return next(new ErrorHander("Cannot found Tag...", 404));
    }
    try {
        const updatedTag = await TagModel.findByIdAndUpdate(
            id,
            {
                tag, Status
            },
            { new: true }
        );

        if (!updatedTag) {
            return res.status(404).json({ message: "Tag not found" });
        }

        return res.status(200).json({
            success: true,
            msg: "Updated successfully...",
            updatedTag,
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update Tag" });
    }
});
