var subject = require('../Docstring__parseTypeString');
var assert = require('chai').assert;

describe('CJS::Parser::Docstring::Tag::parseTypeString', function() {
  [
    {
      sample: 'Simple type',
      string: 'String',
      types: [
        { name: 'String' }
      ]
    },

    {
      sample: 'JSDoc-style union type',
      string: 'String|number',
      types: [
        {
          name: 'Union',
          elements: [
            { name: 'String' },
            { name: 'number' },
          ]
        }
      ]
    },

    {
      sample: 'Closure-style non-nullable type (variant 1)',
      string: '!boolean',
      types: [
        { name: 'boolean', nullable: false },
      ]
    },

    {
      sample: 'Closure-style non-nullable type (variant 2)',
      string: 'boolean!',
      types: [
        { name: 'boolean', nullable: false },
      ]
    },

    {
      sample: 'Closure-style nullable type (variant 1)',
      string: 'String?',
      types: [
        { name: 'String', nullable: true }
      ]
    },
    {
      sample: 'Closure-style nullable type (variant 2)',
      string: '?String',
      types: [
        { name: 'String', nullable: true }
      ]
    },
    {
      sample: 'Closure-style optional type (variant 1)',
      string: 'String=',
      types: [
        { name: 'String', optional: true }
      ]
    },
    {
      sample: 'Closure-style optional type (erratic)',
      string: '=String',
      error: true
    },
    {
      sample: 'JSDoc-style array',
      string: 'String[]',
      types: [
        { name: 'Array', elements: [{ name: 'String' }] },
      ]
    },
    {
      sample: 'Closure-style array',
      string: 'Array.<String>',
      types: [
        { name: 'Array', elements: [{ name: 'String' }] },
      ]
    },
    {
      sample: 'Closure-style array (without dot)',
      string: 'Array<String>',
      types: [
        { name: 'Array', elements: [{ name: 'String' }] },
      ]
    },

    {
      sample: 'Closure-style array with nullable element',
      string: 'Array<String?>',
      types: [
        { name: 'Array', elements: [{ name: 'String', nullable: true }] },
      ]
    },
    {
      sample: 'Closure-style array with non-nullable element',
      string: 'Array<String!>',
      types: [
        { name: 'Array', elements: [{ name: 'String', nullable: false }] },
      ]
    },

    {
      sample: 'Closure-style array with multiple elements',
      string: 'Array<String, Object>',
      types: [
        { name: 'Array', elements: [{ name: 'String' }, { name: 'Object' }] },
      ]
    },

    {
      sample: 'Closure-style object with key/value types',
      string: 'Object<String, Object>',
      types: [
        { name: 'Object', elements: [{ name: 'String' }, { name: 'Object' }] },
      ]
    },

    {
      sample: 'Closure-style literal objects',
      string: '{ name: String, value: Number }',
      types: [
        {
          name: 'Object',
          elements: [
            {
              name: 'ObjectProperty',
              key: { name: 'name' },
              value: { name: 'String' }
            },
            {
              name: 'ObjectProperty',
              key: { name: 'value' },
              value: { name: 'Number' }
            }
          ]
        },
      ]
    },

    {
      sample: 'Array of literal objects',
      string: 'Array.<{ name: String, value: Number }>',
      types: [
        {
          name: 'Array',
          elements: [
            {
              name: 'Object',
              elements: [
                {
                  name: 'ObjectProperty',
                  key: { name: 'name' },
                  value: { name: 'String' }
                },
                {
                  name: 'ObjectProperty',
                  key: { name: 'value' },
                  value: { name: 'Number' }
                }
              ]
            }
          ]
        },
      ]
    },

    {
      sample: 'Closure-style unions',
      string: '(number|boolean)',
      types: [
        { name: 'Union', elements: [{ name: 'number' }, { name: 'boolean' }] },
      ]
    },

    {
      sample: 'Closure-style unions with nullable elements',
      string: '(number|?boolean)',
      types: [
        { name: 'Union', elements: [{ name: 'number' }, { name: 'boolean', nullable: true }] },
      ]
    },
    {
      sample: 'Closure-style unions with required elements',
      string: '(number|!boolean)',
      types: [
        { name: 'Union', elements: [{ name: 'number' }, { name: 'boolean', nullable: false }] },
      ]
    },
    {
      sample: 'A function literal with no parameters',
      string: 'function',
      types: [
        { name: 'Function' },
      ]
    },
    {
      sample: 'A function literal with a single parameter',
      string: 'function(string)',
      types: [
        { name: 'Function', params: [{ name: 'string' }] },
      ]
    },
    {
      sample: 'A function literal with a spread parameter',
      string: 'function(String, ...Number)',
      types: [
        {
          name: 'Function',
          params: [
            { name: 'String', },
            { name: 'Number', repeatable: true },
          ]
        },
      ]
    },
    {
      sample: 'A function literal with a return type',
      string: 'function(): Number',
      types: [
        {
          name: 'Function',
          returnType: {
            name: 'Number'
          }
        },
      ]
    },
    {
      sample: 'A function literal with a complexreturn type',
      string: 'function(): (String|Number|void)',
      types: [
        {
          name: 'Function',
          returnType: {
            name: 'Union',
            elements: [
              { name: 'String' },
              { name: 'Number' },
              { name: 'void' },
            ]
          }
        },
      ]
    },
    {
      sample: 'A callback type',
      string: 'My~Callback',
      types: [
        {
          name: 'My~Callback',
        }
      ]
    },
    {
      sample: 'Closure-style "all" type',
      string: '*',
      types: [
        {
          name: 'AllLiteral',
        }
      ]
    },
    {
      sample: 'Closure-style "unknown" type',
      string: '?',
      types: [
        {
          name: 'UnknownLiteral',
        }
      ]
    },
  ].forEach(function(spec) {
    var fn = spec.only ? it.only : it;
    fn((spec.sample || '') +  " ('" + spec.string + "')", function() {
      if (spec.error) {
        assert.throws(function() {
          subject(spec.string)
        }, typeof spec.error === 'string' ? spec.error : undefined);

        return;
      }

      assert.equal(
        JSON.stringify(subject(spec.string)),
        JSON.stringify(spec.types[0])
      );
    });
  });
});