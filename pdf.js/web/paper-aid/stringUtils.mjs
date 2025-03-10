//taken from https://github.com/aceakash/string-similarity, based on Dice's Coefficient
const compareTwoStrings = (first, second) => {
  first = first.replace(/\s+/g, '');
  second = second.replace(/\s+/g, '');

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
};

export const findLongestTerm = data => {
  console.log('data:', data.definitions);
  if (!data || data.length === 0) return null;

  let maxWords = 0;

  for (let i = 0; i < data.length; ++i) {
    if (data[i]['term'].split(' ').length > maxWords) {
      maxWords = data[i]['term'].split(' ').length;
    }
  }
  console.log('maxWords:', maxWords);
  return maxWords;
};

export const matchWordAndTerm = (word,definitions,context) => {
  const wordArray = word.split(' ');
  var maxSimilarity = 0.4;
  var bestDefinition = null;
  var bestTerm = null;

  while (context >= 0) {
    for (let i = 0; i < wordArray.length - context + 1; ++i) {
      const currentTerm = wordArray.slice(i, i + context).join(' ');
      console.log('currentTerm:', currentTerm);
      for (const { term, definition } of definitions) {
        const similarity = compareTwoStrings(currentTerm, term);
        if (similarity >= maxSimilarity) {
          maxSimilarity = similarity;
          bestDefinition = definition;
          bestTerm = term;
        }
      }
    }
    context -= 1;
  }

  return { bestTerm, bestDefinition };
}