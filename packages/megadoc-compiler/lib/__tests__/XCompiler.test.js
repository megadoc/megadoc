const { assert } = require('chai');
const path = require('path');
const Subject = require('../XCompiler');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('XCompiler', function() {
  const fileSuite = FileSuite(this);

  describe('.createProcessingList', function() {
    let processorSpec, output;

    beforeEach(function() {
      fileSuite.createFile('sources/a.js');
      fileSuite.createFile('sources/b.md');

      processorSpec = fileSuite.createFile('parse.js', `
        const path = require('path');

        module.exports = {
          parseFnPath: path.resolve(__dirname, './parseFn.js'),
        };
      `);

      output = Subject.createProcessingList({
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
      });
    });

    it('should include the matching files', function() {
      assert.equal(output.files.length, 1);
    });

    it('should extract the function paths', function() {
      assert.equal(output.processor.parseFnPath,
        path.join(path.dirname(processorSpec.path), 'parseFn.js')
      );
    });

    it('should store the processor options', function() {
      assert.deepEqual(output.processor.options, { foo: 'bar' });
    });
  });

  describe('#parse', function() {
    context('given an atomic processor...', function() {
      it('should distribute each file to it', function(done) {
        const parseFnFile = fileSuite.createFile('parse.js', `
          module.exports = function(options, filePath, done) {
            done(null, 'foo');
          };
        `);

        const processingList = [
          {
            files: [
              'a',
              'b',
            ],
            processor: {
              atomic: true,
              parseFnPath: parseFnFile.path,
            }
          }
        ];

        Subject.parse({}, processingList, function(err, [{ rawDocuments }]) {
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

        const processingList = [
          {
            files: [
              'a',
              'b',
            ],
            processor: {
              atomic: false,
              parseBulkFnPath: parseBulkFnFile.path,
            }
          }
        ];

        Subject.parse({}, processingList, function(err, [{ rawDocuments }]) {
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

      const processingList = [
        {
          files: [
            'a',
            'b',
          ],
          processor: {
            atomic: true,
            parseFnPath: parseFnFile.path,
          }
        }
      ];

      Subject.parse({}, processingList, function(err, [{ rawDocuments }]) {
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

  describe('#reduce', function() {
    it('should pass each file through to the reducer', function(done) {
      const reduceFnFile = fileSuite.createFile('reduceFn.js', `
        module.exports = function(options, rawDocument, done) {
          done(null, { id: rawDocument.id, name: rawDocument.id + '__name' });
        };
      `);

      const parseState = {
        files: [
          'a',
          'b',
        ],

        processor: {
          reduceFnPath: reduceFnFile.path,
        },

        rawDocuments: [
          {
            id: '1'
          }
        ]
      };

      Subject.reduce({}, [parseState], function(err, [{ documents }]) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(documents.length, 1);
          assert.include(documents[0], {
            id: '1',
            name: '1__name'
          });

          done();
        }
      });
    });
  });

});