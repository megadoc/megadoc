module.exports = function partial(fn, x) {
  return fn.bind(null, x);
}
