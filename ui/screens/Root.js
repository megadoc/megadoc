const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const Router = require('core/Router');
const ColorSchemeManager = require('core/ColorSchemeManager');
const ScrollSpy = require('core/ScrollSpy');
const config = require('config');
const SpotlightManager = require('components/SpotlightManager');
const Inspector = require('components/Inspector');

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
    ColorSchemeManager.load();

    Storage.on('change', this.reload);
    AppState.on('change', this.reload);

    if (config.scrollSpying) {
      ScrollSpy.start();
    }

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

    if (config.scrollSpying) {
      ScrollSpy.stop();
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

        <Outlet name="Layout" elementProps={this.props} />
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
      e.preventDefault();

      Router.transitionTo(e.target.href.replace(location.origin, ''));
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