const fuzzaldrin = require('fuzzaldrin-plus');

function TokenSearcherFuzzaldrin(tokens) {
  const flatMap = tokens.reduce(function(map, token) {
    const context = token.link.context || '';

    if (token.$1) map[prefixByContext(token.$1)] = token;
    if (token.$2) map[prefixByContext(token.$2)] = token;
    if (token.$3) map[prefixByContext(token.$3)] = token;

    function prefixByContext(string) {
      return `${context} ${string}`;
    }

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

module.exports = TokenSearcherFuzzaldrin;
