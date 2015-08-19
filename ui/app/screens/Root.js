var React = require("react");
var Router = require("react-router");
var RouteActions = require("actions/RouteActions");
var Banner = require('components/Banner');
var Footer = require('components/Footer');
var TwoColumnLayout = require('components/TwoColumnLayout');
var Storage = require('core/Storage');
var ColorSchemeManager = require('core/ColorSchemeManager');
var classSet = require('utils/classSet');

var { RouteHandler } = Router;

var Root = React.createClass({
  mixins: [ Router.Navigation, Router.State ],

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
      started: false
    };
  },

  componentDidMount: function() {
    RouteActions.assignDelegate(this);
    ColorSchemeManager.load();

    if (this.props.onStart) {
      this.props.onStart();
    }

    Storage.on('change', this.reload);
    TwoColumnLayout.on('change', this.reload);

    // we need the router to be running for LinkResolvers to register
    // themselves *before* we start rendering anything.
    this.setState({ started: true });
  },

  componentWillUnmount: function() {
    TwoColumnLayout.off('change', this.reload);
    Storage.off('change', this.reload);
    RouteActions.assignDelegate(undefined);
  },

  render() {
    if (!this.state.started) {
      return null;
    }

    var className = classSet({
      'root': true,
      'root--with-two-column-layout': TwoColumnLayout.isActive()
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
});

module.exports = Root;