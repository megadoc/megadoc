var Store = require('core/Store');
var { where } = require('lodash');

var OutletStore = new Store({
  getInitialState: function() {
    return {
      outlets: []
    };
  },

  setOutletElements(outlets) {
    this.setState({ outlets });
  },

  getElements(outlet) {
    return where(this.state.outlets, { outlet });
  }
});

module.exports = OutletStore;