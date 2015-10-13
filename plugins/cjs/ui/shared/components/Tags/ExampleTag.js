var React = require("react");
var HighlightedText = require('components/HighlightedText');
var PrecompiledText = require('components/PrecompiledText');

var ExampleTag = React.createClass({
  displayName: "ExampleTag",

  propTypes: {
    string: React.PropTypes.string,
  },

  render() {
    var { name, description } = this.props.typeInfo;

    return (
      <div className="example-tag">
        <p>
          {name && (
            <div>
              <strong>Example: </strong>
              <span
                dangerouslySetInnerHTML={{
                __html: name
                }}
              />
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