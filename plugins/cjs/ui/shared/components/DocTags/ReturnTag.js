var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ReturnTag = React.createClass({
  displayName: "ReturnTag",

  propTypes: {
    withTitle: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      withTitle: false
    };
  },

  render() {
    var name = this.props.description.split(' ')[0];
    var description = this.props.description.replace(name, '');
    var isOptional = name[0] === '[' && name[name.length-1] === ']';

    if (isOptional) {
      name = name.substr(1, name.length-2);
    }

    var defaultValueMatcher = name.match(/^[\w_\.]+[\d]*\=(.*)$/);
    var defaultValue;

    if (defaultValueMatcher) {
      defaultValue = defaultValueMatcher[1];
      name = name.replace('='+defaultValue, '');
    }

    let hasName = name.length > 0;

    return (
      <li className="return-tag">
        <header className="return-tag__header">
          {this.props.withTitle && (
            <strong>
              Returns
            </strong>
          )}

          {hasName && <code className="return-tag__name">{name}</code>}

          {this.props.types && (
            <code className="return-tag__types">
              {hasName && ': '}
              {this.props.types.join(', ')}

              {defaultValue && (
                <span className="param-tag__default-value">
                  {' ('}defaults to: <code>{defaultValue}</code>)
                </span>
              )}
            </code>
          )}
        </header>

        <MarkdownText className="return-tag__description">
          {description.replace(/[ ]{5,8}/g, '')}
        </MarkdownText>
      </li>
    );
  }
});

module.exports = ReturnTag;