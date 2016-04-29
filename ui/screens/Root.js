const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const Router = require('core/Router');
const ColorSchemeManager = require('core/ColorSchemeManager');
const ScrollSpy = require('core/ScrollSpy');
const config = require('config');
const SpotlightManager = require('components/SpotlightManager');
const TooltipManager = require('components/TooltipManager');

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

    setTimeout(Router.refreshScroll, 1);
  },

  shouldComponentUpdate(nextProps) {
    return this.props.params !== nextProps.params;
  },

  componentWillUnmount() {
    if (config.scrollSpying) {
      ScrollSpy.stop();
    }

    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    return (
      <Outlet name="LayoutWrapper" forwardChildren>
        {config.tooltipPreviews && (<TooltipManager />)}
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
});

module.exports = Root;