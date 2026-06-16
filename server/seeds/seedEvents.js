const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Event = require('../models/Event');

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user to associate with createdBy
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️ No admin user found. Creating one first...');
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@volunteer.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        phone: '+1234567890',
        skills: ['management', 'leadership'],
        availability: 'both'
      });
      console.log('✅ Created admin@volunteer.com');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('🧹 Cleared existing events');

    const baseDate = new Date();

    const sampleEvents = [
      {
        title: 'Coastal Beach Cleanup',
        description: 'Help us clean up the local coastline and protect marine life. We will gather trash, sort recyclables, and install new public recycling bins. Gloves, bags, and water will be provided.',
        date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
        endDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
        location: 'Sunset Beach Park, South Pavilion',
        category: 'cleanup',
        maxVolunteers: 30,
        currentVolunteers: 0,
        createdBy: admin._id,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Introduction to Web Dev Boot Camp',
        description: 'Join us in teaching basic HTML, CSS, and JS to underprivileged teenagers in our community center. Help them build their very first personal websites! Curriculum is pre-designed.',
        date: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days in future
        endDate: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // +6 hours
        location: 'Downtown Public Library, Lab B',
        category: 'education',
        maxVolunteers: 10,
        currentVolunteers: 0,
        createdBy: admin._id,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Community Food Drive & Distribution',
        description: 'Sort and pack donated food items for distribution to local families in need. Volunteers are needed to help organize boxes, load trucks, and register families at the pickup desks.',
        date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
        endDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // +5 hours
        location: 'Hope Food Pantry, 101 Civic Center Way',
        category: 'food-drive',
        maxVolunteers: 25,
        currentVolunteers: 0,
        createdBy: admin._id,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Senior Citizen Tech Support Clinic',
        description: 'Help senior citizens learn how to use their smartphones, tablets, and computers. We will assist them with video calling family, setting up emails, online safety, and using basic utilities.',
        date: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days in future
        endDate: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
        location: 'Golden Oaks Retirement Village, Recreation Room',
        category: 'elderly-care',
        maxVolunteers: 15,
        currentVolunteers: 0,
        createdBy: admin._id,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Free Health Screening Fair',
        description: 'Looking for medical volunteers (nurses, doctors, EMTs) and general check-in coordinators to assist with our annual free basic health screenings (blood pressure, glucose, BMI).',
        date: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days in future
        endDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // +8 hours
        location: 'Valley Community Clinic, Outpatient Wing',
        category: 'healthcare',
        maxVolunteers: 20,
        currentVolunteers: 0,
        createdBy: admin._id,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
      }
    ];

    await Event.create(sampleEvents);
    console.log('✅ 5 sample events seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding events error:', error.message);
    process.exit(1);
  }
};

seedEvents();
