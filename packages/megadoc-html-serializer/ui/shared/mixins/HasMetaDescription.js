const MetaDescriptionManager = require('core/MetaDescriptionManager');
const IDENTITY = function(arg) {
  return arg;
};

module.exports = function(generate) {
  let manager;

  if (typeof generate === 'string') {
    generate = IDENTITY.bind(null, generate);
  }

  return {
    componentWillMount: function() {
      manager = MetaDescriptionManager(generate.bind(this));
    },

    componentDidMount: function() {
      manager.update();
    },

    componentDidUpdate: function() {
      manager.update();
    },

    componentWillUnmount: function() {
      manager.restore();
      manager = null;
    }
  };
};