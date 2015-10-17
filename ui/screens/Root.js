const React = require("react");
const { RouteHandler } = require("react-router");
const SinglePageLayout = require('components/SinglePageLayout');
const MultiPageLayout = require('components/MultiPageLayout');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const ColorSchemeManager = require('core/ColorSchemeManager');
const config = require('config');
const $ = require('jquery');
const Router = require('core/Router');

const Root = React.createClass({
  propTypes: {
    onStart: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      query: {},
      params: {}
    };
  },

  getInitialState: function() {
    return {
      started: false,
      layoutChanged: false,
      // layout: config.layout,
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

    // we need the router to be running for LinkResolvers to register
    // themselves *before* we start rendering anything.
    this.setState({ started: true });
  },

  componentDidUpdate: function(prevProps, prevState) {
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
    AppState.off('layoutChange', this.trackLayoutChange);
    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    if (!this.state.started) {
      return null;
    }

    const Layout = AppState.getLayout() === 'single-page' ?
      SinglePageLayout :
      MultiPageLayout
    ;

    return (
      <Layout {...this.props}>
        <RouteHandler onChange={this.reload} {...this.props} />
      </Layout>
    );
  },

  reload: function() {
    this.forceUpdate();
  },

  trackLayoutChange() {
    this.setState({ layoutChanged: true });
  }
});

module.exports = Root;