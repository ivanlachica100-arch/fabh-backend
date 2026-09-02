const BoardingHouse = require('../models/BoardingHouse');
const DAGUPAN_CAMPUSES = require('../config/landmarks');

// @desc    Create a new Boarding House listing
// @route   POST /api/boarding-houses
// @access  Private (Landlord / Admin only)
const createListing = async (req, res) => {
  try {
    req.body.landlord = req.user._id;

    const { lng, lat, ...otherData } = req.body;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude coordinates',
      });
    }

    const listingData = {
      ...otherData,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };

    const listing = await BoardingHouse.create(listingData);

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all listings with optional filter & distance to selected campus
// @route   GET /api/boarding-houses
// @access  Public
const getListings = async (req, res) => {
  try {
    const { campus = 'UPANG', maxDistance = 5000, maxPrice } = req.query;

    const targetCampus = DAGUPAN_CAMPUSES[campus.toUpperCase()];
    if (!targetCampus) {
      return res.status(400).json({
        success: false,
        message: `Invalid campus code. Choose from: ${Object.keys(DAGUPAN_CAMPUSES).join(', ')}`,
      });
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: targetCampus.coordinates,
          },
          distanceField: 'distanceToCampusInMeters',
          maxDistance: parseInt(maxDistance),
          spherical: true,
        },
      },
    ];

    if (maxPrice) {
      pipeline.push({
        $match: { monthlyRent: { $lte: parseFloat(maxPrice) } },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'landlord',
        foreignField: '_id',
        as: 'landlordInfo',
      },
    });

    const listings = await BoardingHouse.aggregate(pipeline);

    res.status(200).json({
      success: true,
      campus: targetCampus.name,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all listings belonging to the logged-in Landlord
// @route   GET /api/boarding-houses/my-listings
// @access  Private (Landlord / Admin)
const getMyListings = async (req, res) => {
  try {
    const listings = await BoardingHouse.find({ landlord: req.user._id });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a Boarding House listing
// @route   PUT /api/boarding-houses/:id
// @access  Private (Owner Landlord / Admin)
const updateListing = async (req, res) => {
  try {
    let listing = await BoardingHouse.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing',
      });
    }

    if (req.body.lng && req.body.lat) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      };
    }

    listing = await BoardingHouse.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Boarding House listing
// @route   DELETE /api/boarding-houses/:id
// @access  Private (Owner Landlord / Admin)
const deleteListing = async (req, res) => {
  try {
    const listing = await BoardingHouse.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    await listing.deleteOne();

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const { calculateTOPSIS } = require('../utils/topsis');

// @desc    Compare multiple boarding houses using TOPSIS quantitative decision engine
// @route   POST /api/boarding-houses/compare
// @access  Public
const compareListings = async (req, res) => {
  try {
    const { houseIds, campus = 'UPANG', weights } = req.body;

    if (!houseIds || !Array.isArray(houseIds) || houseIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of at least 2 house IDs to compare.',
      });
    }

    const targetCampus = DAGUPAN_CAMPUSES[campus.toUpperCase()];
    if (!targetCampus) {
      return res.status(400).json({
        success: false,
        message: `Invalid campus code. Choose from: ${Object.keys(DAGUPAN_CAMPUSES).join(', ')}`,
      });
    }

    // Use $geoNear to automatically compute the distance of each selected house to the campus
    const mongoose = require('mongoose');
    const objectIds = houseIds.map((id) => new mongoose.Types.ObjectId(id));

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: targetCampus.coordinates,
          },
          distanceField: 'distanceToCampusInMeters',
          spherical: true,
        },
      },
      {
        $match: {
          _id: { $in: objectIds },
        },
      },
    ];

    const houses = await BoardingHouse.aggregate(pipeline);

    if (houses.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'Could not find enough matching boarding houses to compare.',
      });
    }

    // Run the TOPSIS mathematical algorithm
    const rankedResults = calculateTOPSIS(houses, weights);

    res.status(200).json({
      success: true,
      campus: targetCampus.name,
      totalCompared: rankedResults.length,
      recommendation: `The top recommended boarding house is ${rankedResults[0].title} with a score of ${rankedResults[0].topsisScore}`,
      data: rankedResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
};