var TitleManager = require('core/TitleManager');
var IDENTITY = function(arg) {
  return arg;
};

module.exports = function(generateTitle) {
  var titleManager;

  if (typeof generateTitle === 'string') {
    generateTitle = IDENTITY.bind(null, generateTitle);
  }

  titleManager = new TitleManager(generateTitle);

  return {
    componentDidMount: function() {
      titleManager.update(this);
    },

    componentDidUpdate: function() {
      titleManager.update(this);
    },

    componentWillUnmount: function() {
      titleManager.restore();
      titleManager = null;
    }
  };
};