var React = require("react");
var HighlightedText = require('components/HighlightedText');
var TypeNames = require('./TypeNames');

var ParamTag = React.createClass({
  displayName: "ParamTag",

  propTypes: {
    withTitle: React.PropTypes.bool,
    typeInfo: React.PropTypes.shape({
      type: React.PropTypes.object,
      name: React.PropTypes.string,
      defaultValue: React.PropTypes.string,
      description: React.PropTypes.string
    })
  },

  getDefaultProps: function() {
    return {
      withTitle: false
    };
  },

  render() {
    const { typeInfo } = this.props;

    return (
      <li className="param-tag">
        <header className="param-tag__header">
          {this.props.withTitle && <strong>Parameter{' '}</strong>}

          <code className="param-tag__name">{typeInfo.name}</code>

          {typeInfo.type && (
            <code className="param-tag__types">
              {': '}

              <TypeNames type={typeInfo.type} />

              {typeInfo.defaultValue && (
                <span className="param-tag__default-value">
                  {' ('}defaults to: <code>{typeInfo.defaultValue}</code>)
                </span>
              )}
            </code>
          )}
        </header>

        {typeInfo.description && (
          <HighlightedText className="param-tag__description">
            {typeInfo.description.replace(/[ ]{4,}/g, '')}
          </HighlightedText>
        )}
      </li>
    );
  }
});

module.exports = ParamTag;