const renderRoutines = require('megadoc-html-serializer/lib/renderRoutines');
const CV = require('megadoc-html-serializer/lib/CompositeValue');
const deepGet = require('lodash').get;
const util = require('util');
const { assert } = require('chai');

exports.getRenderer = function() {
  return renderRoutines;
};

exports.assertDidRender = function(descriptor, spec) {
  exports.assertCompositeValueIsEqual(
    exports.getValueAt(descriptor, spec.location),
    spec.using
  );
};

exports.assertCompositeValueIsEqual = function(value, descriptor) {
  assert(!!CV.isCompositeValue(value),
    "Expected value to be composite, but got a scalar:\n" +
      "\tType: " + typeof value + "\n" +
      "\tValue: " + util.inspect(value)
  );

  assert.deepEqual(value, descriptor)
  // console.log(descriptors);
};

exports.getValueAt = function(descriptor, path) {
  return deepGet(descriptor, path);
}