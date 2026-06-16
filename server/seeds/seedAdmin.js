const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@volunteer.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@volunteer.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      phone: '+1234567890',
      skills: ['management', 'leadership'],
      availability: 'both'
    });

    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@volunteer.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
