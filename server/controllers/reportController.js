const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get dashboard summary
// @route   GET /api/reports/summary
// @access  Admin
exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      totalVolunteers,
      activeVolunteers,
      pendingVolunteers,
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRegistrations
    ] = await Promise.all([
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'volunteer', status: 'active' }),
      User.countDocuments({ role: 'volunteer', status: 'pending' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'completed' }),
      Registration.countDocuments({ status: { $ne: 'cancelled' } })
    ]);

    // Total hours logged
    const hoursResult = await User.aggregate([
      { $match: { role: 'volunteer' } },
      { $group: { _id: null, totalHours: { $sum: '$hoursLogged' } } }
    ]);
    const totalHours = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;

    // Category distribution
    const categoryDistribution = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { 
        $match: { 
          role: 'volunteer',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent activity
    const recentVolunteers = await User.find({ role: 'volunteer' })
      .sort('-createdAt')
      .limit(5)
      .select('name email status createdAt');

    const recentRegistrations = await Registration.find({ status: 'registered' })
      .sort('-createdAt')
      .limit(5)
      .populate('volunteer', 'name email')
      .populate('event', 'title date');

    res.json({
      success: true,
      data: {
        stats: {
          totalVolunteers,
          activeVolunteers,
          pendingVolunteers,
          totalEvents,
          upcomingEvents,
          completedEvents,
          totalRegistrations,
          totalHours
        },
        categoryDistribution,
        monthlyRegistrations,
        recentVolunteers,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('GetDashboardSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get volunteer report (CSV)
// @route   GET /api/reports/volunteers
// @access  Admin
exports.getVolunteerReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const volunteers = await User.find({ role: 'volunteer' })
      .select('name email phone skills availability status hoursLogged createdAt')
      .sort('-createdAt');

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['name', 'email', 'phone', 'skills', 'availability', 'status', 'hoursLogged', 'createdAt'];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(volunteers.map(v => ({
        ...v.toObject(),
        skills: v.skills.join(', '),
        createdAt: new Date(v.createdAt).toLocaleDateString()
      })));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=volunteers_report.csv');
      return res.send(csv);
    }

    res.json({ success: true, data: volunteers });
  } catch (error) {
    console.error('GetVolunteerReport error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get event report (CSV)
// @route   GET /api/reports/events
// @access  Admin
exports.getEventReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort('-date');

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['title', 'date', 'location', 'category', 'status', 'maxVolunteers', 'currentVolunteers', 'createdBy'];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(events.map(e => ({
        ...e.toObject(),
        date: new Date(e.date).toLocaleDateString(),
        createdBy: e.createdBy ? e.createdBy.name : 'N/A'
      })));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=events_report.csv');
      return res.send(csv);
    }

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('GetEventReport error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get hours report
// @route   GET /api/reports/hours
// @access  Admin
exports.getHoursReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const query = { status: 'attended' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const registrations = await Registration.find(query)
      .populate('volunteer', 'name email')
      .populate('event', 'title date location')
      .sort('-createdAt');

    // Aggregate hours by volunteer
    const hoursByVolunteer = {};
    registrations.forEach(reg => {
      const volId = reg.volunteer._id.toString();
      if (!hoursByVolunteer[volId]) {
        hoursByVolunteer[volId] = {
          name: reg.volunteer.name,
          email: reg.volunteer.email,
          totalHours: 0,
          eventsAttended: 0
        };
      }
      hoursByVolunteer[volId].totalHours += reg.hoursWorked;
      hoursByVolunteer[volId].eventsAttended += 1;
    });

    const summary = Object.values(hoursByVolunteer).sort((a, b) => b.totalHours - a.totalHours);

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['name', 'email', 'totalHours', 'eventsAttended'];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(summary);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=hours_report.csv');
      return res.send(csv);
    }

    res.json({ success: true, data: { registrations, summary } });
  } catch (error) {
    console.error('GetHoursReport error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
