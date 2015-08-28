var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ReturnTag = React.createClass({
  displayName: "ReturnTag",

  propTypes: {
    withTitle: React.PropTypes.bool,
    typeInfo: React.PropTypes.shape({
      types: React.PropTypes.arrayOf(React.PropTypes.string),
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

          {typeInfo.types.length > 0 && (
            <code className="return-tag__types">
              {hasName && ': '}
              {typeInfo.types.join(', ')}

              {typeInfo.defaultValue && (
                <span className="param-tag__default-value">
                  {' ('}defaults to: <code>{typeInfo.defaultValue}</code>)
                </span>
              )}
            </code>
          )}
        </header>

        {typeInfo.description && (
          <MarkdownText className="return-tag__description">
            {typeInfo.description.replace(/[ ]{5,8}/g, '')}
          </MarkdownText>
        )}
      </li>
    );
  }
});

module.exports = ReturnTag;