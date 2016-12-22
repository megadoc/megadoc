const { assert } = require('chai');
const subject = require('../stage01__parse');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('stage01__parse', function() {
  const fileSuite = FileSuite(this);

  context('given an atomic processor...', function() {
    it('should distribute each file to it', function(done) {
      const parseFnFile = fileSuite.createFile('parse.js', `
        module.exports = function(options, filePath, done) {
          done(null, 'foo');
        };
      `);

      const compilation = {
        files: [
          'a',
          'b',
        ],
        processor: {
          parseFnPath: parseFnFile.path,
        }
      };

      subject(compilation, function(err, { rawDocuments }) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(rawDocuments.length, 2);
          done();
        }
      });
    });
  });

  context('given a bulk processor...', function() {
    it('should pass it all the files', function(done) {
      const parseBulkFnFile = fileSuite.createFile('parse.js', `
        module.exports = function(options, filePaths, done) {
          done(null, filePaths.map((x,i) => x + String(i)));
        };
      `);

      const compilation = {
        files: [
          'a',
          'b',
        ],
        processor: {
          parseBulkFnPath: parseBulkFnFile.path,
        }
      };

      subject(compilation, function(err, { rawDocuments }) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(rawDocuments.length, 2);
          assert.equal(rawDocuments[0], 'a0');
          assert.equal(rawDocuments[1], 'b1');

          done();
        }
      });
    });
  });

  it('should flatten lists of raw documents emitted by the parser', function(done) {
    const parseFnFile = fileSuite.createFile('parse.js', `
      module.exports = function(options, filePath, done) {
        done(null, [ '1', '2' ]);
      };
    `);

    const compilation = {
      files: [
        'a',
        'b',
      ],
      processor: {
        parseFnPath: parseFnFile.path,
      }
    };

    subject(compilation, function(err, { rawDocuments }) {
      if (err) {
        done(err);
      }
      else {
        assert.equal(rawDocuments.length, 4);
        assert.equal(rawDocuments[0], '1');
        assert.equal(rawDocuments[1], '2');
        assert.equal(rawDocuments[2], '1');
        assert.equal(rawDocuments[3], '2');

        done();
      }
    });
  });
});