const { assert } = require('chai');
const FileSuite = require('megadoc-test-utils/FileSuite');
const subject = require('../parseBulkFn');
const init = require('../initFn');

describe('megadoc-plugin-js::parseBulkFn', function() {
  const fileSuite = FileSuite(this);

  it('works', function(done) {
    const sourceFile1 = fileSuite.createFile('source1.js', `
      /**
       * Beep!
       */
      module.exports = function beep() {}
    `);

    const sourceFile2 = fileSuite.createFile('source2.js', `
      /**
       * Quack!
       */
      module.exports = function quack() {}
    `);

    const context = {
      commonOptions: {},
      options: {},
      state: init({})
    };

    subject(context, [ sourceFile1.path, sourceFile2.path ], function(err, documents) {
      if (err) {
        done(err);
      }
      else {
        assert.equal(documents.length, 2);
        assert.include(documents[0], {
          id: 'beep'
        });

        assert.include(documents[1], {
          id: 'quack'
        });

        done();
      }
    })
  });
});