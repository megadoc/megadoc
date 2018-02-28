const React = require('react');
const describeType = require('../../utils/describeType');

const TypeNames = React.createClass({
  contextTypes: {
    config: React.PropTypes.object.isRequired,
  },

  propTypes: {
    type: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <span
        className="js-type-names"
        dangerouslySetInnerHTML={{
          __html: describeType({
            html: true,
            expandFunctionSignatures: this.context.config.expandReturnedFunctionSignatures
          })(this.props.type)
        }}
      />
    );
  },
});

module.exports = TypeNames;
