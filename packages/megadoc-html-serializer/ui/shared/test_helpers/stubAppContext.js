const React = require('react');
const { PropTypes } = React;
const { OutletManager } = require('react-transclusion');
const DocumentURI = require('../../DocumentURI');
const AppState = require('../../AppState');

module.exports = function stubAppContext(Component, fn) {
  const appState = AppState({});
  const outletManager = OutletManager({
    strict: false,
    verbose: false,
  })

  const documentURI = new DocumentURI({
    mountPath: null,
    extension: '.html',
  })

  return React.createClass({
    childContextTypes: {
      appState: PropTypes.object,
      config: PropTypes.object,
      documentURI: PropTypes.instanceOf(DocumentURI),
      outletManager: PropTypes.object,
    },

    getChildContext() {
      const overrides = typeof fn === 'function' ? fn() : fn;

      return Object.assign({}, {
        appState,
        config: {},
        documentURI,
        outletManager,
      }, overrides);
    },

    render() {
      return <Component {...this.props} />
    }
  });
};