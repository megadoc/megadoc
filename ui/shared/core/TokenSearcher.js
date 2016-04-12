// const Fuse = require('fuse.js');
// const fuzzy = require('utils/fuzzy');
const fuzzaldrin = require('fuzzaldrin-plus');

function TokenSearcherFuzzaldrin(tokens) {
  const flatMap = tokens.reduce(function(map, token) {
    map[token.$1] = token;
    if (token.$2) map[token.$2] = token;
    if (token.$3) map[token.$3] = token;

    return map;
  }, {});

  const strings = Object.freeze(Object.keys(flatMap).filter(x => !!x));

  return {
    search(term) {
      const results = fuzzaldrin.filter(strings, term.trim());

      // we need to do this round-trip because the same index can be referenced
      // by multiple tokens (and thus multiple results) but the consumer expects
      // no duplicates
      const uniqueResults = results.reduce(function(map, text) {
        const token = flatMap[text];

        if (!(token.link.href in map)) {
          map[token.link.href] = token;
        }

        return map;
      }, {});

      return Object.keys(uniqueResults).map(key => uniqueResults[key]);
    }
  };
}

// function TokenSearcherFuze(tokens) {
//   const fuse = new Fuse(tokens, {
//     threshold: 0.4,
//     distance: 100,
//     include: [ 'score', 'matches' ],
//     keys: [
//       { name: '$1', weight: 1, },
//       { name: '$2', weight: 1 / 2, },
//       { name: '$3', weight: 1 / 4, },
//     ],

//     getFn(obj, path) {
//       return obj[path];
//     },

//     sortFn(a, b) {
//       const scoreA = computeMatchRangeScore(a);
//       const scoreB = computeMatchRangeScore(b);

//       if (scoreA === scoreB) {
//         return 0;
//       }
//       else if (scoreA > scoreB) {
//         return -1;
//       }
//       else {
//         return 1;
//       }
//     }
//   });

//   return {
//     search(term) {
//       return fuzzy.filter(term, tokens, {
//         extract(token) { return token.$1; }
//       }).map(function(x) {
//         return { item: x.original, matches: [{ key: '$1' }] }
//       });
//       return fuse.search(term.trim());
//     }
//   };

//   function computeMatchRangeScore(item) {
//     const output = item.output[0];

//     return output.matchedIndices.reduce((acc, x) => {
//       return acc + (x[1] - x[0]);
//     }, 0) / item.item[output.key].length
//       + (output.matchedIndices.filter(x => x[0] !== x[1]).reduce((a, x) => a + (x[1] - x[0]), 0))
//     ;
//   }

//   function dump(result, score) {
//     console.log.apply(console, [
//       result.item[result.output[0].key],
//         +score.toFixed(2),
//         +result.score.toFixed(2),
//         result.output[0].score !== result.output[0].nScore ?
//           [result.output[0].score, result.output[0].nScore] :
//           undefined
//     ].filter(x => !!x));
//   }
// }

module.exports = TokenSearcherFuzzaldrin;
