const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.get('/today', auth, dashboardController.getToday);
router.get('/weekly', auth, dashboardController.getWeekly);
router.get('/highlights', auth, dashboardController.getHighlights);

module.exports = router;
