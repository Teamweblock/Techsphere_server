const express = require("express");
const { getPlayer, ConnectMessage, followCategory, unfollowCategory, followTag, unfollowTag, subscribe } = require("../controllers/userControllers");

const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/authMiddleware");


router.get("/profile", isAuthenticatedUser, getPlayer);
router.post("/ConnectMessage", isAuthenticatedUser, ConnectMessage);
router.post("/followCategory", isAuthenticatedUser, followCategory);
router.post("/unfollowCategory", isAuthenticatedUser, unfollowCategory);
router.post("/followTag", isAuthenticatedUser, followTag);
router.post("/unfollowTag", isAuthenticatedUser, unfollowTag);
router.post("/subscribe", subscribe);

module.exports = router;
