module.exports = function(str) {
  return str
    .replace(/[\W]/g, '_')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    })
  ;
};