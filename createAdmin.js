require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    // Delete existing admin so there is no conflict
    await User.deleteOne({ email: 'admin@fabh.com' });

    // Pass the plain-text password — Mongoose pre('save') will hash it once
    const admin = await User.create({
      name: 'FABH Administrator',
      email: 'admin@fabh.com',
      password: 'Admin123!',
      role: 'admin',
      landlordApplication: { status: 'none' },
    });

    console.log('Admin account created successfully:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);

    // Verify match directly
    const userWithPassword = await User.findOne({ email: 'admin@fabh.com' }).select('+password');
    const isMatch = await userWithPassword.matchPassword('Admin123!');
    console.log('Password verified successfully:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();