module.exports = function(filePath) {
  var node = document.createElement('link');
  node.href = filePath;
  node.rel = 'stylesheet';
  node.type = 'text/css';
  document.head.appendChild(node);
};