const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered'
  },
  hoursWorked: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ volunteer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
