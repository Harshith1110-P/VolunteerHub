const express = require('express');
const {
  getAllVolunteers,
  getVolunteer,
  updateVolunteer,
  updateVolunteerStatus,
  deleteVolunteer
} = require('../controllers/volunteerController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', protect, roleCheck('admin'), getAllVolunteers);
router.get('/:id', protect, getVolunteer);
router.put('/:id', protect, updateVolunteer);
router.patch('/:id/status', protect, roleCheck('admin'), updateVolunteerStatus);
router.delete('/:id', protect, roleCheck('admin'), deleteVolunteer);

module.exports = router;
