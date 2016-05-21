var React = require("react");
var HighlightedText = require('components/HighlightedText');
var TypeNames = require('./TypeNames');

var ReturnTag = React.createClass({
  displayName: "ReturnTag",

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
    const hasName = Boolean(typeInfo.name);

    return (
      <li className="return-tag">
        <header className="return-tag__header">
          {this.props.withTitle && (
            <strong>
              Returns
            </strong>
          )}

          {hasName && <code className="return-tag__name">{typeInfo.name}</code>}

          {typeInfo.type && (
            <code className="return-tag__types">
              {hasName && ': '}

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
          <HighlightedText className="return-tag__description">
            {typeInfo.description.replace(/[ ]{5,8}/g, '')}
          </HighlightedText>
        )}
      </li>
    );
  }
});

module.exports = ReturnTag;