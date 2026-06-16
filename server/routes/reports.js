const express = require('express');
const {
  getDashboardSummary,
  getVolunteerReport,
  getEventReport,
  getHoursReport
} = require('../controllers/reportController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/summary', protect, roleCheck('admin'), getDashboardSummary);
router.get('/volunteers', protect, roleCheck('admin'), getVolunteerReport);
router.get('/events', protect, roleCheck('admin'), getEventReport);
router.get('/hours', protect, roleCheck('admin'), getHoursReport);

module.exports = router;
