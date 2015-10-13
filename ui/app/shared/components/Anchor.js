const React = require('react');
const Router = require('core/Router');
const { string, object } = React.PropTypes;

const Anchor = React.createClass({
  propTypes: {
    routeName: string,
    params: object,
  },

  render() {
    const { params } = this.props;
    const href = Router.makeHref(
      this.props.routeName,
      Object.keys(params).reduce(function(encoded, key) {
        encoded[key] = encodeURIComponent(params[key]);
        return encoded;
      }, {})
    );

    return (
      <a name={href.replace(/^#/, '')} />
    );
  }
});

module.exports = Anchor;
