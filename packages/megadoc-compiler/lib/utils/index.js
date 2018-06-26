const async = require('async');
const R = require('ramda');

exports.asyncSequence = fns => async.seq.apply(async, fns.filter(x => !!x));
exports.asyncify = async.asyncify;

exports.asyncEnsure = f => g => (x, callback) => {
  const fOnce = R.once(f)
  const propagateError = err => {
    fOnce(x, function() {
      callback(err)
    })
  };

  const callbackAndRestore = function(err, result) {
    process.removeListener('uncaughtException', propagateError);

    callback(err, result);
  }

  try {
    process.addListener('uncaughtException', propagateError);

    g(x, function(err, result) {
      fOnce(x, function() {
        callbackAndRestore(err, result);
      })
    })
  }
  catch (err) {
    fOnce(x, function() {
      callbackAndRestore(err);
    })
  }
};

exports.asyncMaybe = function(f, done) {
  return (err, x) => {
    if (err) {
      done(err);
    }
    else {
      done(null, f(x));
    }
  }
};

exports.asyncNoop = (x, y, callback) => callback();