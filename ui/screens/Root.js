const React = require("react");
const { RouteHandler } = require("react-router");
const Outlet = require('components/Outlet');
const SinglePageLayout = require('components/SinglePageLayout');
const MultiPageLayout = require('components/MultiPageLayout');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const ColorSchemeManager = require('core/ColorSchemeManager');
const ScrollSpy = require('core/ScrollSpy');
const config = require('config');
const SpotlightManager = require('components/SpotlightManager');
const TooltipManager = require('components/TooltipManager');

const Root = React.createClass({
  propTypes: {
    onStart: React.PropTypes.func,
    params: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      query: {},
      params: {}
    };
  },

  getInitialState: function() {
    return {
      layoutChanged: false,
    };
  },

  componentDidMount: function() {
    ColorSchemeManager.load();

    if (this.props.onStart) {
      this.props.onStart();
    }

    Storage.on('change', this.reload);
    AppState.on('change', this.reload);
    AppState.on('layoutChange', this.trackLayoutChange);

    if (config.scrollSpying) {
      ScrollSpy.start();
    }
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.params !== nextProps.params;
  },

  componentDidUpdate: function() {
    if (this.state.layoutChanged) {
      // force the browser to (re)scroll to the proper location
      setTimeout(() => {
        const originalLocation = window.location.hash;

        window.location.hash = '#/';
        window.location.hash = originalLocation;
      }, 0);

      this.setState({ layoutChanged: false });
    }
  },

  componentWillUnmount: function() {
    if (config.scrollSpying) {
      ScrollSpy.stop();
    }

    AppState.off('layoutChange', this.trackLayoutChange);
    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    const Layout = AppState.getLayout() === 'single-page' ?
      SinglePageLayout :
      MultiPageLayout
    ;

    return (
      <Outlet name="LayoutWrapper" props={{}} forwardChildren>
        <Layout {...this.props}>
          {config.spotlight && (
            <SpotlightManager
              active={AppState.isSpotlightOpen()}
              onOpen={AppState.openSpotlight}
              onClose={AppState.closeSpotlight}
            />
          )}

          {config.tooltipPreviews && (
            <TooltipManager />
          )}

          <RouteHandler onChange={this.reload} {...this.props} />
        </Layout>
      </Outlet>
    );
  },

  reload: function() {
    this.forceUpdate();
  },

  trackLayoutChange() {
    this.setState({ layoutChanged: true });
  },
});

module.exports = Root;