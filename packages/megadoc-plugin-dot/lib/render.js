var nomnoml = require('nomnoml');

module.exports = function(_code) {
  var code = [
    '#fontSize: 10',
    '#font: Monospace',
    '#lineWidth: 1',
    '#fill: #f4f4f4',   // TODO: use styleOverride / VARIABLE
    '#stroke: #404244', // TODO: use styleOverride / VARIABLE
    ''
  ].join('\n') + _code;

  var svg = nomnoml.renderSvg(code);

  return '<div class="plugin-dot__container">' + svg + '</div>';
};