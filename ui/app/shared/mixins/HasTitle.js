var TitleManager = require('core/TitleManager');
var IDENTITY = function(arg) {
  return arg;
};

module.exports = function(generateTitle) {
  var titleManager;

  if (typeof generateTitle === 'string') {
    generateTitle = IDENTITY.bind(null, generateTitle);
  }

  return {
    componentWillMount: function() {
      titleManager = new TitleManager(generateTitle.bind(this));
    },

    componentDidMount: function() {
      titleManager.update();
    },

    componentDidUpdate: function() {
      titleManager.update();
    },

    componentWillUnmount: function() {
      titleManager.restore();
      titleManager = null;
    }
  };
};