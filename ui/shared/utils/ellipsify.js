module.exports = function(text, limit, ellipses) {
  if (text.length > limit) {
    return text.substr(0, limit-3) + (ellipses || '...');
  }
  else {
    return text;
  }
};