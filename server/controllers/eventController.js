const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { category, status, search, sort = '-date', page = 1, limit = 20 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GetAllEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get registrations for this event
    const registrations = await Registration.find({ event: req.params.id })
      .populate('volunteer', 'name email phone skills');

    res.json({ success: true, data: event, registrations });
  } catch (error) {
    console.error('GetEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, location, category, maxVolunteers, image } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      location,
      category,
      maxVolunteers,
      image,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('CreateEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('UpdateEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Also delete all registrations for this event
    await Registration.deleteMany({ event: req.params.id });

    res.json({ success: true, message: 'Event and related registrations removed' });
  } catch (error) {
    console.error('DeleteEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This event has been cancelled' });
    }

    if (event.currentVolunteers >= event.maxVolunteers) {
      return res.status(400).json({ success: false, message: 'This event is full' });
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ 
      volunteer: req.user._id, 
      event: req.params.id 
    });

    if (existingReg) {
      if (existingReg.status === 'cancelled') {
        // Re-register
        existingReg.status = 'registered';
        await existingReg.save();
        event.currentVolunteers += 1;
        await event.save();
        return res.json({ success: true, data: existingReg, message: 'Re-registered successfully' });
      }
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const registration = await Registration.create({
      volunteer: req.user._id,
      event: req.params.id
    });

    // Increment current volunteers
    event.currentVolunteers += 1;
    await event.save();

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    console.error('RegisterForEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
  try {
    const registration = await Registration.findOne({ 
      volunteer: req.user._id, 
      event: req.params.id,
      status: 'registered'
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement current volunteers
    const event = await Event.findById(req.params.id);
    if (event && event.currentVolunteers > 0) {
      event.currentVolunteers -= 1;
      await event.save();
    }

    res.json({ success: true, message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('UnregisterFromEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's registrations
// @route   GET /api/events/my-registrations
// @access  Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      volunteer: req.user._id,
      status: { $ne: 'cancelled' }
    }).populate('event');

    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error('GetMyRegistrations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
