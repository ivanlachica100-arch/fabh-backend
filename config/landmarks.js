// config/landmarks.js
// Approved collegiate landmarks within Dagupan City core operational zone
// Standard GeoJSON Point coordinates: [longitude, latitude]
const DAGUPAN_CAMPUSES = {
  UPANG: {
    code: 'UPANG',
    name: 'PHINMA University of Pangasinan',
    shortName: 'PHINMA UPang',
    coordinates: [120.3425, 16.0471],
    address: 'Arellano Street, Dagupan City',
  },
  UL: {
    code: 'UL',
    name: 'University of Luzon',
    shortName: 'University of Luzon',
    coordinates: [120.3358, 16.0398],
    address: 'Perez Boulevard, Dagupan City',
  },
  UDD: {
    code: 'UDD',
    name: 'Universidad de Dagupan',
    shortName: 'Universidad de Dagupan',
    coordinates: [120.3408, 16.0508],
    address: 'Arellano Street, Dagupan City',
  },
  LNU: {
    code: 'LNU',
    name: 'Lyceum-Northwestern University',
    shortName: 'Lyceum Northwestern',
    coordinates: [120.3307, 16.0358],
    address: 'Tapuac District, Dagupan City',
  },
  PIMSAT: {
    code: 'PIMSAT',
    name: 'PIMSAT Colleges (Dagupan Branch)',
    shortName: 'PIMSAT Colleges',
    coordinates: [120.3589, 16.0458],
    address: 'Bolosan District, Dagupan City',
  },
  KINGFISHER: {
    code: 'KINGFISHER',
    name: 'Kingfisher School of Business and Finance',
    shortName: 'Kingfisher School',
    coordinates: [120.3256, 16.0224],
    address: 'Lucao District, Dagupan City',
  },
  PMMA: {
    code: 'PMMA',
    name: 'Pangasinan Merchant Marine Academy (PAMMA)',
    shortName: 'PAMMA Dagupan',
    coordinates: [120.3416, 16.0424],
    address: 'Perez Blvd / Tapuac, Dagupan City',
  },
};

module.exports = DAGUPAN_CAMPUSES;