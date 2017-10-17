const async = require('async');

exports.asyncSequence = fns => async.seq.apply(async, fns.filter(x => !!x));
exports.asyncify = async.asyncify;

exports.asyncEnsure = f => g => (x, callback) => {
  try {
    g(x, function(err, result) {
      f(x, function() {
        callback(err, result);
      })
    })
  }
  catch (e) {
    f(x, function() {
      callback(e);
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