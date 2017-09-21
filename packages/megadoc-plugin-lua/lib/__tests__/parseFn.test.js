const parseFn = require('../parseFn');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('megadoc-plugin-lua::parseFn', function() {
  const fileSuite = FileSuite(this);

  it('works', function(done) {
    const sourceFile = fileSuite.createFile('source.lua', ``);
    parseFn({ compilerOptions: {}, options: {} }, sourceFile.path, done)
  });
})
