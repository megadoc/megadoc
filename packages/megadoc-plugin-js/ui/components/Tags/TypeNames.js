const React = require('react');
const renderType = require('../../utils/describeType');

const TypeNames = React.createClass({
  propTypes: {
    type: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <span
        className="js-type-names"
        dangerouslySetInnerHTML={{
          __html: renderType(this.props.type)
        }}
      />
    );
  },
});

module.exports = TypeNames;
