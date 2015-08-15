var { AVAILABLE_SCHEMES, DEFAULT_SCHEME } = require("constants");
var Storage = require('core/Storage');

exports.load = function() {
  var startingScheme;

  try {
    startingScheme = Storage.get('colorScheme');
  }
  finally {
    startingScheme = startingScheme || DEFAULT_SCHEME;
  }

  console.log('>>> loading color scheme: %s <<<', startingScheme);

  document.body.className = startingScheme;
};

exports.switchScheme = function() {
  var className = document.body.className;
  var currScheme, nextScheme;

  AVAILABLE_SCHEMES.some(function(scheme, i) {
    if (className.indexOf(scheme) > -1) {
      currScheme = scheme;
      nextScheme = AVAILABLE_SCHEMES[i+1] || AVAILABLE_SCHEMES[0];
      return true;
    }
  });

  if (currScheme && nextScheme) {
    className = className.replace(currScheme, nextScheme);
  }
  else {
    className = DEFAULT_SCHEME;
  }

  document.body.className = className;

  try {
    Storage.set('colorScheme', nextScheme);
  }
  catch (e) {
    // ignore
  }
};
