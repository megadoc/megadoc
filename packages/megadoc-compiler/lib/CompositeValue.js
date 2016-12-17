const invariant = require('invariant');
const partial = require('./utils/partial');

exports.create = function(type, value) {
  return { $__type: type, $__value: value };
};

exports.getType = function(compositeValue) {
  return compositeValue.$__type;
};

exports.getValue = function(compositeValue) {
  return compositeValue.$__value;
};

exports.compute = function computeCompositeValue(reducers, nextValue) {
  if (isCompositeValue(nextValue)) {
    const reducer = reducers[nextValue.$__type];

    invariant(!!reducer,
      "Unknown CompositeValue of type '" + nextValue.$__type + "'"
    );

    // reduce any inner composite values:
    const primitiveValue = computeCompositeValue(reducers, nextValue.$__value);

    // reduce this value:
    return reducer(primitiveValue, partial(computeCompositeValue, reducers));
  }

  return nextValue;
};

function isCompositeValue(x) {
  return (
    x
    && typeof x === 'object'
    && x.hasOwnProperty('$__type')
    && x.hasOwnProperty('$__value')
  );
}