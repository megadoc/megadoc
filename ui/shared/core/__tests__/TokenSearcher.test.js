const Subject = require("../TokenSearcher");
const { assert } = require('chai');

describe("Core::TokenSearcher", function() {
  const samples = [
    {
      term: 'foo b',
      tokens: [
        { $1: 'Foo - LOL' },
        { $1: 'Zoo' },
        { $1: 'Foo - Bar' },
      ],
      expected: [ 2, 0 ],
    },

    {
      term: 'java testing',
      tokens: [
        { $1: 'JavaScript - Getting Started' },
        { $1: 'JavaScript Testing - Mojo' },
        { $1: 'JavaScript Testing - Testing Promise-basEd Asynchronous Code' },
        { $1: 'Zoo' },
      ],

      expected: [ 1, 2 ],
    },
    {
      term: 'async',
      tokens: [
        { $1: 'JavaScript - Getting Started' },
        { $1: 'JavaScript Testing - Mojo' },
        { $1: 'JavaScript Testing - Testing Promise Asynchronous Code' },
        { $1: 'Zoo' },
      ],

      expected: [ 2 ],
    },
  ];

  samples.forEach(function(sample, index) {
    it(sample.message || `searching for "${sample.term}" (sample #${index})`, function() {
      assertRanked(
        Subject(sample.tokens).search(sample.term),
        sample.expected.map(x => sample.tokens[x]['$1'])
      );
    });
  });

  function assertRanked(results, expectedTokens) {
    const actualTokens = results.map(x => x.item['$1']);

    assert(results.length === expectedTokens.length,
      `
      Expected ${expectedTokens.length} tokens to be matched, not ${results.length}.
      Expected:
          ${expectedTokens.map(x => `\n        - ${x}`).join('')}

      Actual:
          ${actualTokens.map(x => `\n        - ${x}`).join('')}
    `);

    expectedTokens.forEach(function(expected, index) {
      const actual = actualTokens[index];
      assert(actual === expected, `Expected token at ${index} to be "${expected}" but got "${actual}"`);
    });
  }
});