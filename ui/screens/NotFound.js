const React = require("react");
const NotFound = require('components/NotFound');

const NotFoundScreen = React.createClass({
  render() {
    return tinydoc.renderDocument('/'+this.props.params.splat) || <NotFound />
  }
});

module.exports = NotFoundScreen;