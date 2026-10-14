// config/landmarks.js
// Approved collegiate landmarks within Dagupan City core operational zone
// Format: GeoJSON Point coordinates [longitude, latitude]
const DAGUPAN_CAMPUSES = {
  UPANG: {
    code: 'UPANG',
    name: 'PHINMA University of Pangasinan',
    shortName: 'PHINMA UPang',
    coordinates: [120.3392, 16.0425], // Arellano St (Campus center)
    address: 'Arellano Street, Dagupan City',
  },
  UL: {
    code: 'UL',
    name: 'University of Luzon',
    shortName: 'University of Luzon',
    coordinates: [120.3340, 16.0433], // Perez Blvd
    address: 'Perez Boulevard, Dagupan City',
  },
  UDD: {
    code: 'UDD',
    name: 'Universidad de Dagupan',
    shortName: 'Universidad de Dagupan',
    coordinates: [120.3425, 16.0448], // Arellano St East
    address: 'Arellano Street, Dagupan City',
  },
  LNU: {
    code: 'LNU',
    name: 'Lyceum-Northwestern University',
    shortName: 'Lyceum Northwestern',
    coordinates: [120.3541, 16.0503], // Tapuac District
    address: 'Tapuac District, Dagupan City',
  },
  PIMSAT: {
    code: 'PIMSAT',
    name: 'PIMSAT Colleges',
    shortName: 'PIMSAT Colleges',
    coordinates: [120.3385, 16.0405], // Bolosan District
    address: 'Bolosan District, Dagupan City',
  },
  KINGFISHER: {
    code: 'KINGFISHER',
    name: 'Kingfisher School of Business and Finance',
    shortName: 'Kingfisher School',
    coordinates: [120.3662, 16.0418], // Lucao District
    address: 'Lucao District, Dagupan City',
  },
  PMMA: {
    code: 'PMMA',
    name: 'Pangasinan Merchant Marine Academy',
    shortName: 'PMMA Dagupan',
    coordinates: [120.3421, 16.0475], // Tapuac / Perez Area
    address: 'Perez Blvd / Tapuac, Dagupan City',
  },
};

module.exports = DAGUPAN_CAMPUSES;