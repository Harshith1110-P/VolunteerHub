const express = require('express');
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyRegistrations
} = require('../controllers/eventController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/:id', getEvent);

// Protected routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/unregister', protect, unregisterFromEvent);

// Admin-only routes
router.post('/', protect, roleCheck('admin'), createEvent);
router.put('/:id', protect, roleCheck('admin'), updateEvent);
router.delete('/:id', protect, roleCheck('admin'), deleteEvent);

module.exports = router;
