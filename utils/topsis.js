const CRITERIA_CONFIG = [
  { name: 'rent', type: 'cost' },
  { name: 'distance', type: 'cost' },
  { name: 'rating', type: 'benefit' },
  { name: 'amenities', type: 'benefit' },
];

/**
 * Calculates TOPSIS score with optional target budget weighting and explainability insights.
 * @param {Array} houses - Array of boarding house objects
 * @param {Array} weights - Criteria weights [rent, distance, rating, amenities] (default: [0.25, 0.25, 0.25, 0.25])
 * @param {number|null} maxBudget - Optional student max budget constraint
 */
function calculateTOPSIS(houses, weights = [0.25, 0.25, 0.25, 0.25], maxBudget = null) {
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

  // Determine ideal best (V+) and ideal worst (V-) solutions
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
      title: house.title || house.name,
      monthlyRent: house.monthlyRent,
      distanceToCampusInMeters: Math.round(house.distanceToCampusInMeters || 0),
      averageRating: house.averageRating ? Number(house.averageRating.toFixed(1)) : 0,
      amenitiesCount: Object.values(house.amenities || {}).filter(Boolean).length,
      separationBest: parseFloat(sPlus.toFixed(4)),
      separationWorst: parseFloat(sMinus.toFixed(4)),
      topsisScore: parseFloat(score.toFixed(4)),
      isOverBudget,
    };
  });

  // Rank by topsisScore descending
  results.sort((a, b) => b.topsisScore - a.topsisScore);

  // Averages for comparative explainability
  const avgRent = results.reduce((acc, r) => acc + r.monthlyRent, 0) / results.length;
  const minDistance = Math.min(...results.map((r) => r.distanceToCampusInMeters));
  const minPrice = Math.min(...results.map((r) => r.monthlyRent));
  const maxRating = Math.max(...results.map((r) => r.averageRating));

  return results.map((item, index) => {
    let badge = 'Balanced Candidate';
    let rationale = '';

    if (index === 0) {
      badge = 'Best Overall Match';
      const rentDiff = Math.round(avgRent - item.monthlyRent);
      const savingsText = rentDiff > 0 ? `₱${rentDiff.toLocaleString()} below group average` : `within target range`;
      rationale = `Highest multi-criteria closeness (${(item.topsisScore * 100).toFixed(1)}%). Balanced at ${item.distanceToCampusInMeters}m from campus and ${savingsText}.`;
    } else if (item.monthlyRent === minPrice) {
      badge = 'Best Value (Lowest Rent)';
      rationale = `Most economical option at ₱${item.monthlyRent.toLocaleString()}/month.`;
    } else if (item.distanceToCampusInMeters === minDistance) {
      badge = 'Closest to Campus';
      rationale = `Shortest walking commute at only ${item.distanceToCampusInMeters}m to the campus gates.`;
    } else if (item.averageRating === maxRating && maxRating > 0) {
      badge = 'Highest Student Rated';
      rationale = `Top community satisfaction score (${item.averageRating}★ average).`;
    } else {
      rationale = `Scored ${(item.topsisScore * 100).toFixed(1)}% compatibility across price, distance, and inclusions.`;
    }

    return {
      rank: index + 1,
      badge,
      rationale,
      ...item,
    };
  });
}

module.exports = { calculateTOPSIS };