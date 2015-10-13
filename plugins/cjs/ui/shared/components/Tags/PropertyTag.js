const React = require("react");
const MarkdownText = require('components/MarkdownText');
const Types = require('components/Tags/Types');
const Anchor = require('components/Anchor');

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    typeInfo: React.PropTypes.shape({
      types: React.PropTypes.arrayOf(React.PropTypes.string),
      name: React.PropTypes.string,
      defaultValue: React.PropTypes.string,
      description: React.PropTypes.string
    })
  },

  render() {
    const { typeInfo } = this.props;

    return (
      <li className="property-tag">
        <Anchor
          routeName="js.module.entity"
          params={{
            moduleId: this.props.parentPath,
            entity: this.props.path
          }}
        />

        <header className="property-tag__header">
          <span className="property-tag__name">
            <code>{typeInfo.name}</code>
          </span>

          {': '}

          <Types types={typeInfo.types} />
        </header>

        {typeInfo.description && (
          <MarkdownText className="property-tag__description">
            {typeInfo.description}
          </MarkdownText>
        )}

        {typeInfo.defaultValue && (
          <p className="property-tag__default-value">
            Defaults to: <code>{typeInfo.defaultValue}</code>
          </p>
        )}
      </li>
    );
  }
});

module.exports = PropertyTag;