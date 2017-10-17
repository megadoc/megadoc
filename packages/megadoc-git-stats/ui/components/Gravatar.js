const React = require('react');
const md5 = require('md5');

const Gravatar = React.createClass({
  propTypes: {
    email: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ])
  },

  getDefaultProps() {
    return {
      size: 48,
    };
  },

  render: function() {
    const href = 'https://secure.gravatar.com/avatar/';
    const query = `?s=${this.props.size}`;

    return (
      <img
        alt={this.props.title}
        title={this.props.title}
        src={href + md5(this.props.email) + query}
        className="gravatar"
        width={this.props.size}
        height={this.props.size}
      />
    );
  }
});

module.exports = Gravatar;