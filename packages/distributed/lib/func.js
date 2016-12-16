const func = exports;
const vm = require('vm');

func.from = function(fn) {
  return {
    __distributedInternalType: 'func',
    asString: `(function(require, exports) { exports = (${fn.toString()}()) })`
  };
};

func.deserialize = function(fn) {
  if (typeof fn === 'string') {
    return require(fn);
  }
  else if (fn && fn.__distributedInternalType === 'func') {
    return parseFunctionFromString(fn.asString);
    // return (fn.asString);
  }
  else {
    return null;
  }
};

func.call = function(fnDescriptor, ...args) {
  const fn = func.deserialize(fnDescriptor);

  if (fn) {
    // return vm.runInThisContext(fn)(require)
    return fn.apply(null, args);
  }
  else {
    throw new Error("Descriptor is not a function.");
  }
}

function parseFunctionFromString(string) {
  var startBody = string.indexOf('{') + 1;
  var endBody = string.lastIndexOf('}');
  var startArgs = string.indexOf('(') + 1;
  var endArgs = string.indexOf(')');

  return new Function(
    string.substring(startArgs, endArgs),
    string.substring(startBody, endBody)
  );
}

module.exports = func;