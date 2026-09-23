require('dotenv').config();
const mongoose = require('mongoose');
const BoardingHouse = require('./models/BoardingHouse');
const User = require('./models/User');

const sampleBoardingHouses = [
  {
    title: 'Arellano University Belt Dormitory',
    description: 'Affordable and student-friendly rooms near UPang and DCU with study tables and 24/7 security.',
    address: {
      street: 'Arellano St',
      barangay: 'Poblacion Oeste',
      city: 'Dagupan City',
    },
    monthlyRent: 2800,
    roomType: 'shared',
    capacity: 4,
    amenities: ['wifi', 'study-table', 'water-dispenser', 'cctv'],
    averageRating: 4.6,
    numReviews: 12,
    location: {
      type: 'Point',
      coordinates: [120.3401, 16.0435],
    },
    isAvailable: true,
  },
  {
    title: 'Perez Boulevard Student Haven',
    description: 'Solo air-conditioned rooms right along Perez Boulevard. Perfect for quiet study environments.',
    address: {
      street: 'Perez Blvd',
      barangay: 'Herrero-Perez',
      city: 'Dagupan City',
    },
    monthlyRent: 3500,
    roomType: 'solo',
    capacity: 1,
    amenities: ['aircon', 'private-bathroom', 'wifi', 'cctv'],
    averageRating: 4.8,
    numReviews: 19,
    location: {
      type: 'Point',
      coordinates: [120.3365, 16.0428],
    },
    isAvailable: true,
  },
  {
    title: 'Burgos Street Budget Quarters',
    address: {
      street: 'Burgos St',
      barangay: 'Poblacion Oeste',
      city: 'Dagupan City',
    },
    description: 'Budget-friendly shared boarding house with full kitchen access, within walking distance to University of Luzon.',
    monthlyRent: 2200,
    roomType: 'shared',
    capacity: 2,
    amenities: ['wifi', 'kitchen-access'],
    averageRating: 4.1,
    numReviews: 8,
    location: {
      type: 'Point',
      coordinates: [120.3325, 16.0440],
    },
    isAvailable: true,
  },
  {
    title: 'San Vicente Scholar Residences',
    description: 'Modern student accommodations near PSU Dagupan campus featuring private bathrooms and high-speed Wi-Fi.',
    address: {
      street: 'San Vicente Road',
      barangay: 'San Vicente',
      city: 'Dagupan City',
    },
    monthlyRent: 4200,
    roomType: 'solo',
    capacity: 1,
    amenities: ['aircon', 'private-bathroom', 'wifi', 'laundry-area', 'cctv'],
    averageRating: 4.9,
    numReviews: 25,
    location: {
      type: 'Point',
      coordinates: [120.3350, 16.0330],
    },
    isAvailable: true,
  },
  {
    title: 'Lucao Greenview Ladies Home',
    description: 'Gated ladies dormitory along De Venecia extension with power generator backup and spacious study areas.',
    address: {
      street: 'De Venecia Highway',
      barangay: 'Lucao',
      city: 'Dagupan City',
    },
    monthlyRent: 3000,
    roomType: 'shared',
    capacity: 2,
    amenities: ['wifi', 'study-table', 'generator-backup'],
    averageRating: 4.3,
    numReviews: 14,
    location: {
      type: 'Point',
      coordinates: [120.3310, 16.0375],
    },
    isAvailable: true,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // 1. Clear out old users so password hashes are re-created fresh
    await User.deleteMany();
    console.log('Cleared existing users.');

    // 2. Create the Admin Account
    await User.create({
      name: 'FABH Administrator',
      email: 'admin@fabh.com',
      password: 'adminpassword123',
      role: 'admin',
    });
    console.log('✅ Created Admin Account: admin@fabh.com / adminpassword123');

    // 3. Create a verified Landlord Account
    const landlord = await User.create({
      name: 'Mang Danilo Landlord',
      email: 'landlord@fabh.com',
      password: 'landlordpassword123',
      role: 'landlord',
      landlordApplication: {
        status: 'approved',
        contactNumber: '09171234567',
        governmentIdType: 'UMID',
        idDocumentUrl: 'https://example.com/verified-id.png',
        ownershipDocumentUrl: 'https://example.com/verified-permit.png',
      },
    });
    console.log('✅ Created Landlord Account: landlord@fabh.com / landlordpassword123');

    // 4. Create a Demo Student Account
    await User.create({
      name: 'UPang Scholar Student',
      email: 'student@fabh.com',
      password: 'studentpassword123',
      role: 'student',
    });
    console.log('✅ Created Student Account: student@fabh.com / studentpassword123');

    // 5. Clear and re-seed Boarding Houses
    await BoardingHouse.deleteMany();
    console.log('Cleared existing boarding house listings.');

    const preparedListings = sampleBoardingHouses.map((item) => ({
      ...item,
      landlord: landlord._id,
    }));

    await BoardingHouse.insertMany(preparedListings);
    console.log(`✅ Successfully seeded ${preparedListings.length} boarding houses in Dagupan City.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();