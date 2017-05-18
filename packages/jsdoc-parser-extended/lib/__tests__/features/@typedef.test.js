var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var assert = require('chai').assert;

describe('CJS::Parser - @typedef support', function() {
  it('removes the receiver from the typedef name if it points to the doc', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  */
      // function myModule() {}
      //
      // /**
      //  * @property {myModule~Prop}
      //  * @typedef  {myModule~Prop}
      //  * @property {String} name
      //  */
      // myModule.someProp = null;
    });

    assert.equal(docs.length, 3);
    assert.equal(docs[0].type, K.TYPE_FUNCTION);

    assert.equal(docs[1].type, 'myModule~Prop');
  });

  it('works with es6 exports', function() {
    const docs = TestUtils.parseInline(`
      /**
       * Hello!
       *
       * @typedef  {myModule~Prop}
       * @property {String} name
       */
      export default function myModule() {}

      /**
       * @property {myModule~Prop}
       */
      myModule.someProp = null;
    `, { parserOptions: { presets: [ ['es2015', { modules: false }] ] } });

    assert.equal(docs.length, 3);
    assert.deepEqual(docs.map(x => x.id), ['myModule', 'myModule~Prop', 'myModule.someProp'])
  });
});