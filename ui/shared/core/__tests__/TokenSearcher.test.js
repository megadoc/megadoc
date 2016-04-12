const Subject = require("../TokenSearcher");
const { assert } = require('chai');
const { assign } = require('lodash');

describe("Core::TokenSearcher", function() {
  const samples = [
    {
      term: 'foo b',
      tokens: [
        { $1: 'Foo - LOL' },
        { $1: 'Zoo' },
        { $1: 'Foo - Bar' },
      ],
      expected: [ 2 ],
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
    {
      term: 'cache',

      tokens: [
        { $1: 'Checkbox' },
        { $1: 'Scheduler' },
        { $2: '#isAttachedToDOM' },
        { $1: 'SchemaPropTypes' },
        { $2: 'checkAndSend' },
        { $1: 'Data.Cache#unshiftInCollection' },
        { $1: 'Data.Cache#addToCollection' },
        { $1: 'Data.Cache#setCollection' },
        { $1: 'Data.Cache' },
      ],

      strict: false,
      expected: [ 8, 7,6,5 ],
    },

    {
      term: 'conv',

      tokens: [
        { $2: '#hasConnectionError' },
        { $2: '#unshiftInCollection' },
        { $1: 'JavaScript Conventions - Introduction' },
        { $1: 'JavaScript Conventions - Naming Conventions' },
        { $1: 'JavaScript Conventions - Component Structure' },
        { $1: 'JavaScript Conventions - Conditional Sub Rendering' },
        { $2: '#getCollection' },
        { $2: '#setCollection' },
        { $2: '#addToCollection' },
      ],

      strict: true,
      expected: [ 2, 3, 4, 5 ],
      // $only: true
    },
  ];

  samples.forEach(function(sample, index) {
    const func = sample.$only ? it.only : it;
    func(sample.message || `searching for "${sample.term}" (sample #${index})`, function() {
      assertRanked(
        Subject(sample.tokens.map(x => assign({}, x, { link: { href: x.$1 || x.$2 } }))).search(sample.term),
        sample.expected.map(x => sample.tokens[x]['$1'] || sample.tokens[x]['$2']),
        sample.strict
      );
    });
  });

  function assertRanked(results, expectedTokens, strict) {
    const actualTokens = results.map(x => x.$1);

    if (strict) {
      assert(results.length === expectedTokens.length,
        `
        Expected ${expectedTokens.length} tokens to be matched, not ${results.length}.
        Expected:
            ${expectedTokens.map(x => `\n        - ${x}`).join('')}

        Actual:
            ${actualTokens.map(x => `\n        - ${x}`).join('')}
      `);
    }

    expectedTokens.forEach(function(expected, index) {
      const actual = actualTokens[index];
      assert(actual === expected, `Expected token at ${index} to be "${expected}" but got "${actual}"`);
    });
  }
});