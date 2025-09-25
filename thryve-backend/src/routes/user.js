const express = require("express");
const router = express.Router();
const { updatePreferences, getPreferences } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// GET current preferences
router.get("/preferences", authMiddleware, getPreferences);

// UPDATE preferences
router.put("/preferences", authMiddleware, updatePreferences);

module.exports = router;
