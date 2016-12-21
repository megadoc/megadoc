module.exports = function partial(fn) {
  const applications = [].slice.call(arguments, 1);

  return fn.bind.apply(fn, [ null ].concat(applications));
}
