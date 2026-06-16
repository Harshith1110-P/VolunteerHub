const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['cleanup', 'education', 'healthcare', 'food-drive', 'animal-welfare', 'elderly-care', 'other'],
    default: 'other'
  },
  maxVolunteers: {
    type: Number,
    required: [true, 'Maximum volunteers count is required'],
    min: [1, 'At least 1 volunteer slot required']
  },
  currentVolunteers: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentVolunteers >= this.maxVolunteers;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
