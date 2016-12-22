const CompositeValue = require('./CompositeValue');
const isCompositeValue = CompositeValue.isCompositeValue;

module.exports = function transformValue(source, spec, transformFn) {
  if (Array.isArray(spec)) {
    return spec.map(function(item, index) {
      return transformValue(source ? source[index] : undefined, spec[index], transformFn);
    });
  }
  else if (isPrimitiveObject(spec) && !isCompositeValue(spec)) {
    const combinedKeys = combineObjectKeys(source, spec);

    return combinedKeys.reduce(function(map, key) {
      let nextValue;

      if (spec.hasOwnProperty(key)) {
        nextValue = transformValue(source ? source[key] : undefined, spec[key], transformFn);
      }
      else {
        nextValue = source ? source[key] : undefined;
      }

      if (nextValue !== undefined) {
        map[key] = nextValue;
      }

      return map;
    }, {})
  }
  else {
    return transformFn(source, spec);
  }
}

function isPrimitiveObject(x) {
  return x && typeof x === 'object' && x.constructor === Object;
}

function combineObjectKeys(x, y) {
  const aKeys = isPrimitiveObject(x) ? Object.keys(x) : [];
  const bKeys = isPrimitiveObject(y) ? Object.keys(y) : [];

  return unique(aKeys.concat(bKeys));
}

function unique(x) {
  return Object.keys(
    x.reduce(function(map, y) {
      map[y] = true;
      return map;
    }, {})
  );
}