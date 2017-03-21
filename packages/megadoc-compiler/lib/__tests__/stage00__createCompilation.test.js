const { assert } = require('chai');
const path = require('path');
const subject = require('../stage00__createCompilation');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('stage00__createCompilation', function() {
  const fileSuite = FileSuite(this);

  let processorSpec, output;

  beforeEach(function() {
    fileSuite.createFile('sources/a.js');
    fileSuite.createFile('sources/b.md');

    processorSpec = fileSuite.createFile('parse.js', `
      const path = require('path');

      module.exports = {
        parseFnPath: path.resolve(__dirname, './parseFn.js'),
        reduceFnPath: path.resolve(__dirname, './reduceFn.js'),
      };
    `);

    output = subject(
      { commonOption: 1 },
      {},
      {
        pattern: /\.js$/,
        include: [
          path.join(fileSuite.getRootDirectory(), 'sources'),
        ],
        processor: {
          name: processorSpec.path,
          options: {
            foo: 'bar'
          }
        }
      }
    );
  });

  it('should include the matching files', function() {
    assert.equal(output.files.length, 1);
  });

  it('should extract the function paths', function() {
    assert.equal(output.processor.parseFnPath,
      path.join(path.dirname(processorSpec.path), 'parseFn.js')
    );
  });

  it('should store the common options', function() {
    assert.deepEqual(output.commonOptions, { commonOption: 1 });
  });

  it('should store the processor options', function() {
    assert.deepEqual(output.processorOptions, { foo: 'bar' });
  });

  context('given a pair of processor config', function() {
    beforeEach(function() {
      output = subject(
        { commonOption: 1 },
        {},
        {
          pattern: /\.js$/,
          include: [
            path.join(fileSuite.getRootDirectory(), 'sources'),
          ],
          processor: [processorSpec.path, {
            foo: 'bar'
          }]
        }
      );
    });

    it('should store the processor options', function() {
      assert.deepEqual(output.processorOptions, { foo: 'bar' });
    });
  })
});