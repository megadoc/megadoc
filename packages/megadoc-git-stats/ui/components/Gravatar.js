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
    const { props } = this;
    const href = 'https://secure.gravatar.com/avatar/';
    const query = `?s=${props.size}`;

    return (
      <img
        alt={props.title}
        title={props.title}
        src={href + md5(props.email) + query}
        className="gravatar"
        width={props.size}
        height={props.size}
      />
    );
  }
});

module.exports = Gravatar;