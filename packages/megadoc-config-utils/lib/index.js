exports.getConfigurablePair = function getConfigurablePair(item) {
  if (typeof item === 'string') {
    return { name: item, options: null };
  }
  else if (Array.isArray(item)) {
    return { name: item[0], options: item[1] };
  }
  else {
    return null;
  }
};