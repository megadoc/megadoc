module.exports = function(filePath) {
  var script = document.createElement('script');
  script.src = filePath;
  script.type = 'text/javascript';
  script.async = false;
  document.head.appendChild(script);
};