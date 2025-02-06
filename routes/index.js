const express = require("express");
const router = express.Router();
const homeControllers = require("../controllers/homeControllers.js");

router.get("/", homeControllers.home);

// Auth
router.use("/auth", require("./authRoutes.js"));

// user
router.use("/user", require("./user"));
router.use("/category", require("./category"));
router.use("/tag", require("./tag"));
router.use("/news", require("./news"));

module.exports = router;
