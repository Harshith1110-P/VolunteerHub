const User = require('../models/User');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Admin
exports.getAllVolunteers = async (req, res) => {
  try {
    const { status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = { role: 'volunteer' };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const volunteers = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: volunteers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GetAllVolunteers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private
exports.getVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, data: volunteer });
  } catch (error) {
    console.error('GetVolunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update volunteer profile
// @route   PUT /api/volunteers/:id
// @access  Private
exports.updateVolunteer = async (req, res) => {
  try {
    const { name, phone, skills, availability, bio } = req.body;

    // Only allow users to update their own profile (unless admin)
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (skills) updateData.skills = skills;
    if (availability) updateData.availability = availability;
    if (bio !== undefined) updateData.bio = bio;

    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, data: volunteer });
  } catch (error) {
    console.error('UpdateVolunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update volunteer status (admin)
// @route   PATCH /api/volunteers/:id/status
// @access  Admin
exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, data: volunteer });
  } catch (error) {
    console.error('UpdateVolunteerStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete volunteer
// @route   DELETE /api/volunteers/:id
// @access  Admin
exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findByIdAndDelete(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, message: 'Volunteer removed successfully' });
  } catch (error) {
    console.error('DeleteVolunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
