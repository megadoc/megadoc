module.exports = function wrapArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  else if (value !== undefined) {
    return [ value ];
  }
  else {
    return undefined;
  }
}
