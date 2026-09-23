const CRITERIA_CONFIG = [
  { name: 'rent', type: 'cost' },
  { name: 'distance', type: 'cost' },
  { name: 'rating', type: 'benefit' },
  { name: 'amenities', type: 'benefit' },
];

/**
 * Calculates TOPSIS score with optional target budget weighting.
 * @param {Array} houses - Array of boarding house objects
 * @param {Array} weights - Criteria weights [rent, distance, rating, amenities] (default: [0.3, 0.3, 0.2, 0.2])
 * @param {number|null} maxBudget - Optional student max budget constraint
 */
function calculateTOPSIS(houses, weights = [0.3, 0.3, 0.2, 0.2], maxBudget = null) {
  if (!houses || houses.length < 2) {
    throw new Error('TOPSIS requires at least 2 boarding houses to compare.');
  }

  const parsedBudget = maxBudget && Number(maxBudget) > 0 ? Number(maxBudget) : null;

  // Build decision matrix with budget-aware cost adjustments
  const matrix = houses.map((house) => {
    let effectiveRent = house.monthlyRent;

    // Apply progressive penalty factor if property exceeds student's max budget
    if (parsedBudget && house.monthlyRent > parsedBudget) {
      const overageRatio = (house.monthlyRent - parsedBudget) / parsedBudget;
      effectiveRent = house.monthlyRent * Math.pow(1 + overageRatio, 2);
    }

    const amenitiesScore = Object.values(house.amenities || {}).filter(Boolean).length;

    return [
      effectiveRent,
      house.distanceToCampusInMeters || 1000,
      house.averageRating || 3.0,
      amenitiesScore,
    ];
  });

  const m = matrix.length;
  const n = CRITERIA_CONFIG.length;

  // Vector normalization
  const normMatrix = Array.from({ length: m }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < m; i++) {
      sumSq += Math.pow(matrix[i][j], 2);
    }
    const denom = Math.sqrt(sumSq) || 1;

    for (let i = 0; i < m; i++) {
      normMatrix[i][j] = matrix[i][j] / denom;
    }
  }

  // Weight normalized decision matrix
  const weightedMatrix = normMatrix.map((row) =>
    row.map((val, j) => val * weights[j])
  );

  // Determine ideal best (A+) and ideal worst (A-) solutions
  const idealBest = [];
  const idealWorst = [];

  for (let j = 0; j < n; j++) {
    const colValues = weightedMatrix.map((row) => row[j]);
    const isBenefit = CRITERIA_CONFIG[j].type === 'benefit';

    if (isBenefit) {
      idealBest.push(Math.max(...colValues));
      idealWorst.push(Math.min(...colValues));
    } else {
      idealBest.push(Math.min(...colValues));
      idealWorst.push(Math.max(...colValues));
    }
  }

  // Calculate Euclidean separation measures and relative closeness
  const results = houses.map((house, i) => {
    let distToBestSq = 0;
    let distToWorstSq = 0;

    for (let j = 0; j < n; j++) {
      distToBestSq += Math.pow(weightedMatrix[i][j] - idealBest[j], 2);
      distToWorstSq += Math.pow(weightedMatrix[i][j] - idealWorst[j], 2);
    }

    const sPlus = Math.sqrt(distToBestSq);
    const sMinus = Math.sqrt(distToWorstSq);

    const totalDist = sPlus + sMinus;
    const score = totalDist === 0 ? 0.5 : sMinus / totalDist;
    const isOverBudget = parsedBudget ? house.monthlyRent > parsedBudget : false;

    return {
      houseId: house._id,
      title: house.title,
      monthlyRent: house.monthlyRent,
      distanceToCampusInMeters: house.distanceToCampusInMeters,
      averageRating: house.averageRating,
      topsisScore: parseFloat(score.toFixed(4)),
      isOverBudget,
    };
  });

  // Rank by topsisScore descending
  results.sort((a, b) => b.topsisScore - a.topsisScore);

  return results.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}

module.exports = { calculateTOPSIS };