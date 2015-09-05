var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ParamTag = React.createClass({
  displayName: "ParamTag",

  propTypes: {
    withTitle: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      withTitle: false
    };
  },

  render() {
    var { name } = this.props;
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

    return (
      <li className="param-tag">
        <header className="param-tag__header">
          {this.props.withTitle && <strong>Parameter{' '}</strong>}

          <code className="param-tag__name">{name}</code>

          {this.props.types && (
            <code className="param-tag__types">
              {': '}

              {this.props.types.join(', ')}
              {defaultValue && (
                <span className="param-tag__default-value">
                  {' ('}defaults to: <code>{defaultValue}</code>)
                </span>
              )}
            </code>
          )}
        </header>

        <MarkdownText className="param-tag__description">
          {this.props.description.replace(/[ ]{4,}/g, '')}
        </MarkdownText>
      </li>
    );
  }
});

module.exports = ParamTag;