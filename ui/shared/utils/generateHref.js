module.exports = function(rawHref) {
  var isUsingHash = location.hash !== '';
  var prefix = isUsingHash ? '#' : '';
  // var href = prefix + encodeURIComponent(rawHref);
  var href = prefix + rawHref;

  return href;
};