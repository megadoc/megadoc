const React = require("react");
const HighlightedText = require('components/HighlightedText');

const { shape, string } = React.PropTypes;

const ExampleTag = React.createClass({
  displayName: "ExampleTag",

  propTypes: {
    string: string,
    typeInfo: shape({
      name: string,
      description: string,
    })
  },

  render() {
    const { name, description, } = this.props.typeInfo;

    return (
      <div className="example-tag">
        {name && (
          <p>
            <span dangerouslySetInnerHTML={{ __html: name }} />
          </p>
        )}

        <HighlightedText className="example-tag__code">
          {description}
        </HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleTag;