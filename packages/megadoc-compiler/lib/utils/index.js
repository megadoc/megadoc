const R = require('ramda');
const async = require('async');

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

exports.asyncSequence = fns => async.seq.apply(async, fns.filter(x => !!x));
exports.asyncify = async.asyncify;