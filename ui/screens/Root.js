const React = require("react");
const { RouteHandler } = require("react-router");
const Banner = require('components/Banner');
const Footer = require('components/Footer');
const TwoColumnLayout = require('components/TwoColumnLayout');
const Storage = require('core/Storage');
const ColorSchemeManager = require('core/ColorSchemeManager');
const classSet = require('utils/classSet');
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
    TwoColumnLayout.on('change', this.reload);

    // we need the router to be running for LinkResolvers to register
    // themselves *before* we start rendering anything.
    this.setState({ started: true });

    if (!config.useHashLocation) {
      this.interceptInternalLinkClicks();
    }
  },

  componentWillUnmount: function() {
    TwoColumnLayout.off('change', this.reload);
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

    return (
      <div className={className}>
        <Banner />

        <div className="root__screen">
          <RouteHandler onChange={this.reload} {...this.props} />
        </div>

        <Footer />
      </div>
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