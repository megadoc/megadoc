var React = require("react");
var Router = require("react-router");
var RouteActions = require("actions/RouteActions");
var Banner = require('components/Banner');
var Footer = require('components/Footer');
var TwoColumnLayout = require('components/TwoColumnLayout');
var Storage = require('core/Storage');
var ColorSchemeManager = require('core/ColorSchemeManager');
var { APP_DOM_ELEMENT_ID } = require('constants');
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

  componentDidMount: function() {
    RouteActions.assignDelegate(this);
    ColorSchemeManager.load();

    if (this.props.onStart) {
      this.props.onStart(() => {
        this.forceUpdate();
      });
    }

    Storage.on('change', this.reload);
    TwoColumnLayout.on('change', this.reload);
  },

  componentWillUnmount: function() {
    TwoColumnLayout.off('change', this.reload);
    Storage.off('change', this.reload);
    RouteActions.assignDelegate(undefined);
  },

  render() {
    var className = classSet({
      'root': true,
      'root--with-two-column-layout': TwoColumnLayout.isActive()
    });

    return (
      <div id={APP_DOM_ELEMENT_ID /* need this from scrollIntoView */} className={className}>
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