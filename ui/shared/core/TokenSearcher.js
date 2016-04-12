const Fuse = require('fuse.js');

function TokenSearcher(tokens) {
  const fuse = new Fuse(tokens, {
    threshold: 0.4,
    distance: 100,
    include: [ 'score', 'matches' ],
    keys: [
      { name: '$1', weight: 1, },
      { name: '$2', weight: 1 / 8, },
      { name: '$3', weight: 1 / 16, },
    ],

    getFn(obj, path) {
      return obj[path];
    },

    sortFn(a, b) {
      const scoreA = computeMatchRangeScore(a);
      const scoreB = computeMatchRangeScore(b);

      if (scoreA === scoreB) {
        return 0;
      }
      else if (scoreA > scoreB) {
        return 1;
      }
      else {
        return -1;
      }
    }
  });

  return {
    search(term) {
      return fuse.search(term.trim());
    }
  };
}

function computeMatchRangeScore(item) {
  return item.output[0].matchedIndices.reduce((acc, x) => {
    return acc + (x[1] - x[0] + 1);
  }, 0) + item.output[0].matchedIndices.length;
}

module.exports = TokenSearcher;
