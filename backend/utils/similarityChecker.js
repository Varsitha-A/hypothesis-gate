function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3);
}

function similarityScore(text1, text2) {
  if (!text1 || !text2) return 0;

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let commonCount = 0;
  set1.forEach(word => {
    if (set2.has(word)) commonCount++;
  });

  const totalUniqueWords = new Set([...set1, ...set2]).size;

  const similarity = (commonCount / totalUniqueWords) * 100;

  return Math.round(similarity);
}

module.exports = similarityScore;
