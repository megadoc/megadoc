var React = require("react");
var Router = require("react-router");
var RouteActions = require("actions/RouteActions");
var ColorSchemeSwitcher = require("components/ColorSchemeSwitcher");
var Banner = require('components/Banner');
var Storage = require('core/Storage');
var { APP_DOM_ELEMENT_ID } = require('constants');

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

    if (this.props.onStart) {
      this.props.onStart(() => {
        this.forceUpdate();
      });
    }

    Storage.on('change', this.reload);
  },

  componentWillUnmount: function() {
    Storage.off('change', this.reload);
    RouteActions.assignDelegate(undefined);
  },

  render() {
    return (
      <div id={APP_DOM_ELEMENT_ID}>
        <Banner>
          <ColorSchemeSwitcher />
        </Banner>

        <RouteHandler onChange={this.reload} {...this.props} />
      </div>
    );
  },

  reload: function() {
    this.forceUpdate();
  },
});

module.exports = Root;