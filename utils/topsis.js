const CRITERIA_CONFIG = [
  { name: 'rent', type: 'cost' },
  { name: 'distance', type: 'cost' },
  { name: 'rating', type: 'benefit' },
  { name: 'amenities', type: 'benefit' },
];

function calculateTOPSIS(houses, weights = [0.3, 0.3, 0.2, 0.2]) {
  if (!houses || houses.length < 2) {
    throw new Error('TOPSIS requires at least 2 boarding houses to compare.');
  }

  const matrix = houses.map((house) => {
    const amenitiesScore = Object.values(house.amenities || {}).filter(Boolean).length;
    return [
      house.monthlyRent,
      house.distanceToCampusInMeters || 1000,
      house.averageRating || 3.0,
      amenitiesScore,
    ];
  });

  const m = matrix.length;
  const n = CRITERIA_CONFIG.length;

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

  const weightedMatrix = normMatrix.map((row) =>
    row.map((val, j) => val * weights[j])
  );

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

    return {
      houseId: house._id,
      title: house.title,
      monthlyRent: house.monthlyRent,
      distanceToCampusInMeters: house.distanceToCampusInMeters,
      averageRating: house.averageRating,
      topsisScore: parseFloat(score.toFixed(4)),
    };
  });

  results.sort((a, b) => b.topsisScore - a.topsisScore);

  return results.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}

module.exports = { calculateTOPSIS };