const React = require('react');

const TypeNames = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  render() {
    return (
      <span
        className="js-type-names"
        dangerouslySetInnerHTML={{
          __html: this.props.types.join('|')
        }}
      />
    );
  }
});

module.exports = TypeNames;
