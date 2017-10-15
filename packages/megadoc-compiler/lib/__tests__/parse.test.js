const { assert, createFileSuite: FileSuite } = require('megadoc-test-utils');
const subject = require('../parse');
const { createForegroundCluster } = require('divisus');

describe('parse', function() {
  const fileSuite = FileSuite(this);
  const concurrency = 3

  let cluster;

  beforeEach(function(done) {
    cluster = createForegroundCluster();
    cluster.start(done);
  })

  afterEach(function(done) {
    cluster.stop(done);
    cluster = null;
  })

  context('given an atomic processor...', function() {
    it('should distribute each file to it', function(done) {
      const parseFnFile = fileSuite.createFile('parse.js', `
        module.exports = function(options, filePath, done) {
          done(null, 'foo');
        };
      `);

      const compilation = {
        decorators: [],
        files: [
          'a',
          'b',
        ],
        processor: {
          parseFnPath: parseFnFile.path,
        },
      };

      subject(cluster, concurrency, compilation, function(err, { rawDocuments }) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(rawDocuments.length, 2);
          done();
        }
      });
    });

    it('should invoke the decorator parsers', function(done) {
      const parseFnFile = fileSuite.createFile('parse.js', `
        module.exports = function(options, file, done) {
          done(null, {
            title: file,
          });
        };
      `);

      const decoratorParseFnFile = fileSuite.createFile('decorator-parse.js', `
        module.exports = function(context, file, done) {
          done(null, {
            something: file + '__decorated',
          });
        }
      `)

      const compilation = {
        files: [
          'doc1',
          'doc2'
        ],

        processor: {
          parseFnPath: parseFnFile.path,
        },

        decorators: [
          {
            metaKey: 'myDecorations',
            parseFnPath: decoratorParseFnFile.path,
          }
        ]
      };

      subject(cluster, concurrency, compilation, function(err, { rawDocuments, decorations }) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(rawDocuments.length, 2);
          assert.equal(rawDocuments[0].title, 'doc1');

          assert.equal(Object.keys(decorations).length, 2)

          assert.deepEqual(decorations['doc1'], {
            myDecorations: {
              something: 'doc1__decorated'
            }
          })

          assert.deepEqual(decorations['doc2'], {
            myDecorations: {
              something: 'doc2__decorated'
            }
          })

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
        decorators: [],
        files: [
          'a',
          'b',
        ],
        processor: {
          parseBulkFnPath: parseBulkFnFile.path,
        },
      };

      subject(cluster, 3, compilation, function(err, { rawDocuments }) {
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
      decorators: [],
      files: [
        'a',
        'b',
      ],
      processor: {
        parseFnPath: parseFnFile.path,
      }
    };

    subject(cluster, 3, compilation, function(err, { rawDocuments }) {
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