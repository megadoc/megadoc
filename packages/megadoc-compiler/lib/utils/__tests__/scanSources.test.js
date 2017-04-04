const { assert } = require('chai');
const path = require('path');
const subject = require('../scanSources');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('megadoc-compiler::utils::scanSources', function() {
  const fileSuite = FileSuite(this);
  let sourceFiles, output;

  beforeEach(function() {
    sourceFiles = [
      fileSuite.createFile('sources/a.js'),
      fileSuite.createFile('sources/a.md'),
      fileSuite.createFile('sources/exclude_me/b.js'),
      fileSuite.createFile('d.js'),
    ];

    output = subject(
      /\.js$/,
      [ path.join(fileSuite.getRootDirectory(), 'sources/**/*') ],
      [ path.join(fileSuite.getRootDirectory(), 'sources/exclude_me') ]
    );
  });

  it('should include only the files matching the pattern', function() {
    assert.include(output, sourceFiles[0].path);
    assert.notInclude(output, sourceFiles[1].path);
  });

  it('should include only the files in the specified directories', function() {
    assert.notInclude(output, sourceFiles[3].path);
  });

  it('should exclude files matching an exclude directory', function() {
    assert.notInclude(output, sourceFiles[2].path);
  });
});