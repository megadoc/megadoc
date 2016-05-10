const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const config = require('config');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const navigate = require('../utils/navigate');

const Root = React.createClass({
  propTypes: {
    params: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      query: {},
      params: {}
    };
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    AppState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
  },

  shouldComponentUpdate(nextProps) {
    return this.props.params !== nextProps.params;
  },

  componentWillUnmount() {
    window.removeEventListener('click', this.handleInternalLink, false);

    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    return (
      <Outlet name="LayoutWrapper" forwardChildren>
        {config.tooltipPreviews && (<Inspector />)}
        {config.spotlight && (
          <SpotlightManager
            active={AppState.isSpotlightOpen()}
            onOpen={AppState.openSpotlight}
            onClose={AppState.closeSpotlight}
          />
        )}

        {config.scrollSpying && (
          <ScrollSpy />
        )}

        <Layout config={config.layoutOptions} {...this.props} />
      </Outlet>
    );
  },

  reload() {
    this.forceUpdate();
  },

  handleInternalLink(e) {
    if (e.target.tagName === 'A' && e.target.href.indexOf(location.origin) === 0) {
      navigate(e, e.target);
    }
  }
});

module.exports = Root;