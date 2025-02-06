const express = require("express");
const router = express.Router();

const { creatNews,
    getallNews,
    getsingleNews,
    deleteNews,
    updateNews, HomeCategorys, CategoryWisenews, CategoryWiseNewsById, CategoryAndTagWiseNews, CategoryTagAndNewsWiseNews } = require("../controllers/newsControllers");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");


/* --------- New crud section ----------  */

// add
router.post("/create", upload.fields([
    { name: "heroimage", maxCount: 1 }, // Handle heroimage upload
    { name: "image_2", maxCount: 1 },   // Handle image_2 upload
    { name: "image_3", maxCount: 1 },   // Handle image_3 upload
]), creatNews);

//getAllNews
router.get("/all", getallNews);

// get single News
router.get("/single", getsingleNews);

//Delete
router.delete("/delete", deleteNews);

//Update
router.put("/update", updateNews);

//Update
router.get("/HomeCategorys", HomeCategorys);

router.get("/CategoryWisenews", CategoryWisenews);

// Define the route with categoryId as a parameter
router.post("/CategoryWiseNewsById", CategoryWiseNewsById);

// Define the route with categoryId and tagId as query parameters
router.post("/categoryAndTagWiseNews", CategoryAndTagWiseNews);

// Define the route with categoryId, tagId, and newsId as query parameters
router.post("/categoryTagNewsWiseNews", CategoryTagAndNewsWiseNews);

module.exports = router;
