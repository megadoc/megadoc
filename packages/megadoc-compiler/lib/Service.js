const async = require('async');
const R = require('ramda');
const shell = require('./services/shell');
const truthy = x => !!x;
const Service = exports;
const createService = R.curry((preset, params, serviceSpec) => {
  if (typeof preset[serviceSpec.type] === 'function') {
    return preset[serviceSpec.type](params, serviceSpec);
  }
  else {
    console.error(`Unknown service type "${serviceSpec.type}"`);
  }
});

Service.start = function(preset, state) {
  const services = R.map(
    createService(preset,  {
      compilerOptions: state.config,
      timeout: 1500
    }),
    R.uniqBy(R.prop('name'),
      R.filter(truthy,
        R.flatten(
          R.reduce(function(list, compilation) {
            return list.concat(compilation.decorators.map(R.prop('services')))
          }, [], state.compilations)
        )
      )
    )
  );

  return {
    up: R.partial(async.parallel, [services.map(R.prop('up'))]),
    down: R.partial(async.parallel, [services.map(R.prop('down'))]),
  }
}

Service.DefaultPreset = { shell }