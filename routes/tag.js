const express = require("express");
const router = express.Router();

const { creatTag,
    getallTags,
    getsingleTags,
    deleteTag,
    updateTags, } = require("../controllers/tagController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");


/* --------- Tag crud section ----------  */

// add
router.post("/create", creatTag);

//getAllTags
router.get("/all", getallTags);

// get single Tags
router.get("/single", getsingleTags);

//Delete
router.delete("/delete", deleteTag);

//Update
router.put("/update", updateTags);

module.exports = router;
