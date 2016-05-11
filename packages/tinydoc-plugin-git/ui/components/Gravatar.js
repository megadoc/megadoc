const React = require('react');
const md5 = require('md5');

const Gravatar = React.createClass({
  propTypes: {
    email: React.PropTypes.string.isRequired,
    https: React.PropTypes.bool,
    size: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string
    ])

  },

  getDefaultProps: function() {
    return {
      size: 48,
      https: false
    };
  },

  render: function() {
    const { props } = this;
    const href = (props.https || window.location.protocol === 'https:') ?
      'https://secure.gravatar.com/avatar/' :
      'http://www.gravatar.com/avatar/'
    ;

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