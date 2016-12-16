const parseFn = require('../parseFn');
const FileSuite = require('megadoc-test-utils/FileSuite');
const compiler = require('megadoc-compiler');
const path = require('path');

describe('megadoc-plugin-lua::parseFn', function() {
  const fileSuite = FileSuite(this);

  it('works', function(done) {
    const sourceFile = fileSuite.createFile('source.lua', ``);
    parseFn({ common: {}, processor: {} }, sourceFile.path, done)
  });
})

describe('[integration] megadoc-plugin-lua', function() {
  const fileSuite = FileSuite(this);

  describe('#parseFn', function() {
    it('works', function(done) {
      const sourceFile = fileSuite.createFile('source.lua', ``);

      compiler.run({
        tmpDir: path.resolve(fileSuite.getRootDirectory(), 'tmp'),

        sources: [
          {
            pattern: /\.lua$/,
            include: [ path.dirname(sourceFile.path) ],
            processor: {
              name: path.resolve(__dirname, '../xindex.js')
            }
          }
        ]
      }, done)
    });
  });
});