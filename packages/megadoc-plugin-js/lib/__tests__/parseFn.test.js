const { assert } = require('chai');
const subject = require('../parseFn');
const FileSuite = require('megadoc-test-utils/FileSuite');
const configure = require('../configureFn');

describe('megadoc-plugin-js::parseFn', function() {
  const fileSuite = FileSuite(this);

  it('works with a module document', function(done) {
    const context = {
      commonOptions: {},
      options: configure({}),
    };

    const sourceFile1 = fileSuite.createFile('source1.js', `
import { select } from 'd3-selection';

/**
 * @module d3.beep
 *
 * Truncate a <text /> node with "..." if it exceeds a certain width.
 *
 */
module.exports = function(textSelection, width) {
};

    `);

    subject(context, sourceFile1.path, function(err, documents) {
      if (err) {
        return done(err);
      }

      assert.equal(documents.length, 1);
      assert.include(documents[0], {
        id: 'd3.beep',
        type: 'Function'
      }, 'it uses the id as an @id');

      done();
    })
  });

});