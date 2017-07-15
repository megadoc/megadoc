const TitleManager = require('../../TitleManager');
const { PropTypes } = require('react');
const IDENTITY = function(arg) {
  return arg;
};

module.exports = function(generateTitle) {
  var titleManager;

  if (typeof generateTitle === 'string') {
    generateTitle = IDENTITY.bind(null, generateTitle);
  }

  return {
    contextTypes: {
      config: PropTypes.shape({
        title: PropTypes.string,
      }).isRequired,
    },

    componentWillMount: function() {
      titleManager = new TitleManager(generateTitle.bind(this), {
        defaultTitle: this.context.config.title,
      });
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