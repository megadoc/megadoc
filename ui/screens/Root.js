const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const config = require('config');
const SpotlightManager = require('components/SpotlightManager');
const Inspector = require('components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');

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

    if (config.useHashLocation) {
      setTimeout(Router.refreshScroll, 1);
    }
    else {
      window.addEventListener('click', this.handleInternalLink, false);
    }
  },

  shouldComponentUpdate(nextProps) {
    return this.props.params !== nextProps.params;
  },

  componentWillUnmount() {
    if (!config.useHashLocation) {
      window.removeEventListener('click', this.handleInternalLink, false);
    }

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
    if (
      e.target.tagName === 'A'
      && e.target.href.indexOf(location.origin) === 0
      && isLeftClickEvent(e)
      && !isModifiedEvent(e)
    ) {
      e.stopPropagation();
      e.preventDefault();

      const destination = e.target.href.replace(location.origin, '');
      Router.transitionTo(destination);

      if (destination.indexOf('#')) {
        Router.refreshScroll();
      }
    }
  }
});

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

module.exports = Root;