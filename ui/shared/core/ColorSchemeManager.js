var { AVAILABLE_SCHEMES, DEFAULT_SCHEME } = require("constants");
var Storage = require('core/Storage');
var K = require('constants');

var ColorSchemeManager = exports;

ColorSchemeManager.load = function() {
  document.body.className = Storage.get(K.CFG_COLOR_SCHEME);
};

ColorSchemeManager.switchScheme = function(nextScheme = null) {
  var className = document.body.className;
  var currScheme;

  AVAILABLE_SCHEMES.some(function(scheme, i) {
    if (className.indexOf(scheme) > -1) {
      currScheme = scheme;
      nextScheme = nextScheme || AVAILABLE_SCHEMES[i+1] || AVAILABLE_SCHEMES[0];
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
    Storage.set(K.CFG_COLOR_SCHEME, nextScheme);
  }
  catch (e) {
    // ignore
  }
};

ColorSchemeManager.setScheme = function(name) {
  ColorSchemeManager.switchScheme(name);
};

ColorSchemeManager.getCurrentScheme = function() {
  var className = document.body.className;
  var i, scheme;

  for (i = 0; i < AVAILABLE_SCHEMES.length; ++i) {
    scheme = AVAILABLE_SCHEMES[i];

    if (className.indexOf(scheme) > -1) {
      return scheme;
    }
  }
};

Storage.on('change', ColorSchemeManager.load);
