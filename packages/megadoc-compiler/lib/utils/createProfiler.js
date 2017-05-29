const R = require('ramda');

const noopProfiler = () => f => f;
noopProfiler.async = noopProfiler;

const createProfiler = ({ enabled = true, writeFn = Function.prototype }) => {
  if (!enabled) {
    return noopProfiler;
  }

  const evaluate = (stage, x) => R.apply(asFunction(stage))(x);
  const instrument = stage => f => function applyWithInstrumentation() {
    const args = Array.prototype.slice.call(arguments);
    const startedAt = new Date();
    const returnValue = f.apply(null, args);
    const elapsed = (new Date()) - startedAt;

    writeFn({ stage: evaluate(stage, args), elapsed });

    return returnValue;
  }

  const asyncInstrument = stage => f => function applyAsyncWithInstrumentation() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    const callback = Array.prototype.slice.call(arguments, -1)[0];
    const startedAt = new Date();

    f.apply(null, args.concat(function(err, result) {
      const elapsed = (new Date()) - startedAt;

      writeFn({ stage: evaluate(stage, args), elapsed });

      callback(err, result);
    }))
  }


  instrument.async = asyncInstrument;

  return instrument;
}

function asFunction(x) {
  return typeof x === 'function' ? x : R.always(x);
}

module.exports = createProfiler;