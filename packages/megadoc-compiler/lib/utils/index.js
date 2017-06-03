const R = require('ramda');

// String -> a -> {k: v} -> {k: v}
exports.nativeAssoc = R.curry(function nativeAssoc(propName, propValue, x) {
  return Object.assign({}, x, { [propName]: propValue });
});

// String -> {k: v} -> ???
exports.assocWith = R.curry(function assocWith(propName, x) {
  return R.over
  (
    R.lens(R.identity, exports.nativeAssoc(propName))
  )
  (
    x
  );
})

exports.mergeWith = R.curry (function mergeWith(source, x) {
  return Object.assign({}, source, x)
})
