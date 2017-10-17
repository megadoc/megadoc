const { assert, createFileSuite: FileSuite } = require('megadoc-test-utils');
const subject = require('../scanSources');

describe('megadoc-compiler::utils::scanSources', function() {
  const fileSuite = FileSuite(this);
  let sourceFiles, output;

  beforeEach(function(done) {
    sourceFiles = [
      fileSuite.createFile('sources/a.js'),
      fileSuite.createFile('sources/a.md'),
      fileSuite.createFile('sources/exclude_me/b.js'),
      fileSuite.createFile('d.js'),
    ];

    subject({
      include: [ 'sources/**/*' ],
      exclude: 'sources/exclude_me/*',
      rootDir: fileSuite.getRootDirectory(),
    }, function(err, _output) {
      if (err) {
        done(err);
      }
      else {
        output = _output;
        done();
      }
    });
  });

  it('should include only the files in the specified directories', function() {
    assert.notInclude(output, sourceFiles[3].path);
  });

  it('should exclude files matching an exclude directory', function() {
    assert.notInclude(output, sourceFiles[2].path);
  });
});