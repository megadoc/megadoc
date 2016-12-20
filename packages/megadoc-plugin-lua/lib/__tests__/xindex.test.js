const { assert } = require('chai');
const parseFn = require('../parseFn');
const reduceTreeFn = require('../reduceTreeFn');
const FileSuite = require('megadoc-test-utils/FileSuite');
const compiler = require('megadoc-compiler');
const path = require('path');
const b = require('megadoc-corpus').builders;

describe('megadoc-plugin-lua::parseFn', function() {
  const fileSuite = FileSuite(this);

  it('works', function(done) {
    const sourceFile = fileSuite.createFile('source.lua', ``);
    parseFn({ common: {}, processor: {} }, sourceFile.path, done)
  });
})

describe('megadoc-plugin-lua::reduceTreeFn', function() {
  it('works', function() {
    const config = { common: {}, processor: {} };
    const documents = [
      b.document({
        id: 'foo',
        properties: {}
      }),

      b.documentEntity({
        id: 'x',
        properties: {
          receiver: 'foo'
        }
      })
    ];

    const treeOperations = reduceTreeFn(config, documents);

    assert.equal(treeOperations.length, 1);
    assert.include(treeOperations[0], {
      type: 'CHANGE_NODE_PARENT'
    })

    assert.include(treeOperations[0].data, {
      id: documents[1].id,
      parentId: documents[0].id,
    })
  });
})

describe('[integration] megadoc-plugin-lua', function() {
  const fileSuite = FileSuite(this);

  it.only('works', function(done) {
    const sourceFile = fileSuite.createFile('source.lua', `
      --- @module
      --- This here be our CLI module.
      local cli = {}

      --- Ahhh!
      cli.foo = function() end

      return cli
    `);

    compiler.run({
      tmpDir: path.resolve(fileSuite.getRootDirectory(), 'tmp'),
      outputDir: path.resolve(fileSuite.getRootDirectory(), 'dist'),
      verbose: true,

      sources: [
        {
          pattern: /\.lua$/,
          include: [ path.dirname(sourceFile.path) ],
          processor: {
            name: path.resolve(__dirname, '../xindex.js'),
            options: {
              id: 'lua',
              name: 'Lua',
            }
          }
        }
      ]
    }, done)
  });
});