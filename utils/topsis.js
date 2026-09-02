/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
 * Multi-Criteria Decision Making (MCDM) algorithm for FABH.
 */

// Criteria definition:
// criteria = [rent, distance, rating, amenitiesScore]
// types: 'cost' (lower is better) or 'benefit' (higher is better)
const CRITERIA_CONFIG = [
  { name: 'rent', type: 'cost' },
  { name: 'distance', type: 'cost' },
  { name: 'rating', type: 'benefit' },
  { name: 'amenities', type: 'benefit' },
];

/**
 * Calculates TOPSIS ranking scores for given boarding houses.
 * @param {Array} houses - Array of boarding house objects with metrics
 * @param {Array<Number>} weights - Importance weights [rentWeight, distWeight, ratingWeight, amenWeight] (default equal)
 */
function calculateTOPSIS(houses, weights = [0.3, 0.3, 0.2, 0.2]) {
  if (!houses || houses.length < 2) {
    throw new Error('TOPSIS requires at least 2 boarding houses to compare.');
  }

  // 1. Build the Decision Matrix (m alternatives x n criteria)
  const matrix = houses.map((house) => {
    // Amenities score: count active amenities
    const amenitiesScore = Object.values(house.amenities || {}).filter(Boolean).length;

    return [
      house.monthlyRent,
      house.distanceToCampusInMeters || 1000,
      house.averageRating || 3.0,
      amenitiesScore,
    ];
  });

  const m = matrix.length; // Number of houses
  const n = CRITERIA_CONFIG.length; // Number of criteria (4)

  // 2. Vector Normalization: r_ij = x_ij / sqrt(sum(x_kj^2))
  const normMatrix = Array.from({ length: m }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < m; i++) {
      sumSq += Math.pow(matrix[i][j], 2);
    }
    const denom = Math.sqrt(sumSq) || 1; // avoid divide by 0

    for (let i = 0; i < m; i++) {
      normMatrix[i][j] = matrix[i][j] / denom;
    }
  }

  // 3. Weighted Normalized Decision Matrix: v_ij = w_j * r_ij
  const weightedMatrix = normMatrix.map((row) =>
    row.map((val, j) => val * weights[j])
  );

  // 4. Determine Ideal Best (A+) and Ideal Worst (A-) Solutions
  const idealBest = [];
  const idealWorst = [];

  for (let j = 0; j < n; j++) {
    const colValues = weightedMatrix.map((row) => row[j]);
    const isBenefit = CRITERIA_CONFIG[j].type === 'benefit';

    if (isBenefit) {
      idealBest.push(Math.max(...colValues));
      idealWorst.push(Math.min(...colValues));
    } else {
      // Cost criterion: minimum is best, maximum is worst
      idealBest.push(Math.min(...colValues));
      idealWorst.push(Math.max(...colValues));
    }
  }

  // 5. Calculate Euclidean Separation Distances (S+ and S-)
  const results = houses.map((house, i) => {
    let distToBestSq = 0;
    let distToWorstSq = 0;

    for (let j = 0; j < n; j++) {
      distToBestSq += Math.pow(weightedMatrix[i][j] - idealBest[j], 2);
      distToWorstSq += Math.pow(weightedMatrix[i][j] - idealWorst[j], 2);
    }

    const sPlus = Math.sqrt(distToBestSq);
    const sMinus = Math.sqrt(distToWorstSq);

    // 6. Relative Closeness to Ideal Solution: C_i = S- / (S+ + S-)
    const totalDist = sPlus + sMinus;
    const score = totalDist === 0 ? 0.5 : sMinus / totalDist;

    return {
      houseId: house._id,
      title: house.title,
      monthlyRent: house.monthlyRent,
      distanceToCampusInMeters: house.distanceToCampusInMeters,
      averageRating: house.averageRating,
      topsisScore: parseFloat(score.toFixed(4)), // e.g. 0.8421
    };
  });

  // 7. Sort by highest TOPSIS score (Rank 1 is optimal)
  results.sort((a, b) => b.topsisScore - a.topsisScore);

  return results.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}

module.exports = { calculateTOPSIS };