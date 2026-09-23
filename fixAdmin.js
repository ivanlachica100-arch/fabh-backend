require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixAdminNatively() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Delete the old admin document completely
  await User.deleteOne({ email: 'admin@fabh.com' });

  // Create it using Mongoose .create() so the pre-save hook hashes the password ONCE natively
  await User.create({
    name: 'FABH Administrator',
    email: 'admin@fabh.com',
    password: 'Admin123!',
    role: 'admin',
    landlordApplication: { status: 'none' }
  });

  console.log('Admin recreated natively through Mongoose model!');
  process.exit(0);
}

fixAdminNatively();