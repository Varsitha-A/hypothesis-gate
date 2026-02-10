module.exports = function calculateFeasibility(idea) {
  let score = 0;

  const description = idea.description?.toLowerCase() || "";
  const domain = idea.domain?.toLowerCase() || "";

  // Description quality
  if (description.length > 300) score += 30;
  else if (description.length > 200) score += 20;
  else if (description.length > 120) score += 10;

  // Domain relevance
  const popularDomains = [
    "artificial intelligence",
    "machine learning",
    "data science",
    "blockchain",
    "cyber security",
    "cloud computing"
  ];
  if (popularDomains.includes(domain)) score += 20;

  // Technical keyword strength
  const keywords = [
    "ai",
    "ml",
    "nlp",
    "deep learning",
    "neural network",
    "blockchain",
    "iot",
    "api",
    "automation"
  ];

  let keywordCount = 0;
  keywords.forEach((word) => {
    if (description.includes(word)) keywordCount++;
  });
  score += Math.min(keywordCount * 5, 30);

  // Dataset / feasibility hints
  const datasetWords = [
    "dataset",
    "kaggle",
    "open data",
    "github",
    "public api",
    "research paper"
  ];

  datasetWords.forEach((word) => {
    if (description.includes(word)) score += 4;
  });

  // Cap score
  return Math.min(score, 100);
};
