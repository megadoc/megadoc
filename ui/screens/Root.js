const React = require("react");
const { RouteHandler } = require("react-router");
const SinglePageLayout = require('components/SinglePageLayout');
const MultiPageLayout = require('components/MultiPageLayout');
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
    };
  },

  componentDidMount: function() {
    ColorSchemeManager.load();

    if (this.props.onStart) {
      this.props.onStart();
    }

    Storage.on('change', this.reload);

    // we need the router to be running for LinkResolvers to register
    // themselves *before* we start rendering anything.
    this.setState({ started: true });

    if (!config.useHashLocation) {
      this.interceptInternalLinkClicks();
    }
  },

  componentWillUnmount: function() {
    Storage.off('change', this.reload);
  },

  render() {
    if (!this.state.started) {
      return null;
    }

    var className = classSet({
      'root': true,
      'root--with-two-column-layout': TwoColumnLayout.isActive(),
    });

    const Layout = config.layout === 'single-page' ?
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

  interceptInternalLinkClicks() {
    $(document.body).on('click', 'a[data-internal="true"]', function(e) {
      if (!e.ctrlKey && !e.metaKey) {
        const href = $(e.target).attr('href');
        e.preventDefault();
        Router.transitionTo(href.replace(/^#/, ''));
      }
    });
  }
});

module.exports = Root;