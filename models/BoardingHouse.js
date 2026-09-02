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
    // GeoJSON Point format for MongoDB 2dsphere indexing
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      // Note: MongoDB requires coordinates in [longitude, latitude] order
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
    images: {
      type: [String],
      default: ['default-boarding-house.jpg'],
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

// Create 2dsphere index for high-speed spatial proximity queries
boardingHouseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BoardingHouse', boardingHouseSchema);