module.exports = function transformValue(source, spec, transformFn) {
  if (isArrayPair(source, spec)) {
    return spec.map(function(item, index) {
      return transformValue(source[index], spec[index], transformFn);
    });
  }
  else if (isObjectPair(source, spec)) {
    return Object.keys(source).reduce(function(map, key) {
      if (spec.hasOwnProperty(key)) {
        map[key] = transformValue(source[key], spec[key], transformFn);
      }
      else {
        map[key] = source[key];
      }

      return map;
    }, {})
  }
  else {
    return transformFn(source, spec);
  }
}

function isObjectPair(x, y) {
  return isPrimitiveObject(x) && isPrimitiveObject(y);
}

function isArrayPair(x, y) {
  return x && Array.isArray(x) && y && Array.isArray(y);
}

function isPrimitiveObject(x) {
  return x && typeof x === 'object' && x.constructor === Object;
}