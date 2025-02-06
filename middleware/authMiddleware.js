
const jwt = require("jsonwebtoken");
const ErrorHander = require("../utils/errorhandaler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/User.model");

// Correct `isAuthenticatedUser` middleware
module.exports.isAuthenticatedUser = catchAsyncErrors(
    async (req, res, next) => {
        const token = req.headers["x-access-token"];
        if (!token) {
            return next(new ErrorHander("Please Login to access this resource", 401));
        }

        const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // req.user = await User.findById(decodedData.user);
        req.user = decodedData

        // Proceed to the next middleware/route handler
        next();
    }
);
