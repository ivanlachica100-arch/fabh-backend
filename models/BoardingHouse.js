const mongoose = require('mongoose');

const boardingHouseSchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a boarding house title/name'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      street: { type: String, required: true },
      barangay: { type: String, required: true },
      city: { type: String, default: 'Dagupan City' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: String,
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Please specify monthly rent per room/bed in PHP'],
      min: [500, 'Rent must be at least 500 PHP'],
    },
    roomsAvailable: {
      type: Number,
      required: true,
      default: 1,
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      aircon: { type: Boolean, default: false },
      privateBathroom: { type: Boolean, default: false },
      kitchenAllowed: { type: Boolean, default: false },
      cctvSecurity: { type: Boolean, default: false },
      waterIncluded: { type: Boolean, default: false },
      electricityIncluded: { type: Boolean, default: false },
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any',
    },
    contactChannels: {
      phoneNumber: { type: String, default: '09171234567' },
      facebookUrl: { type: String, default: 'https://facebook.com' },
      telegramUsername: { type: String, default: '' },
      whatsappNumber: { type: String, default: '' },
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      ],
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 4.0,
    },
  },
  { timestamps: true }
);

boardingHouseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BoardingHouse', boardingHouseSchema);