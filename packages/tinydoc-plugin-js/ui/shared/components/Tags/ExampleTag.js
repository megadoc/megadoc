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
    const { name, description } = this.props.typeInfo;

    return (
      <div className="example-tag">
        <p>
          {name && (
            <div>
              <strong>Example: </strong>
              <span dangerouslySetInnerHTML={{ __html: name }} />
            </div>
          )}

          {!name && (<strong>Example</strong>)}
        </p>

        <HighlightedText className="example-tag__code">
          {description}
        </HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleTag;