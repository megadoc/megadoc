const React = require("react");
const MarkdownText = require('components/MarkdownText');
const AnchorableHeading = require('components/AnchorableHeading');
const PropertyListing = require('./PropertyListing');
const { shape, string, array } = React.PropTypes;

const APIObject = React.createClass({
  displayName: "APIObject",

  propTypes: {
    anchor: string,
    object: shape({
      id: string,
      title: string,
      text: string,
      schema: array
    })
  },

  getInitialState: function() {
    return {
      expanded: true,
    };
  },

  render() {
    const apiObject = this.props.object;

    return (
      <div className="object-synopsis">
        <AnchorableHeading level="3" withLink={false} href={this.props.anchor}>
          <div className="object-synopsis__header">
            <span className="object-synopsis__header-text">{apiObject.title}</span>

            <button className="object-synopsis__toggler" onClick={this.toggle}>
              {this.state.expanded ? 'Hide' : 'Show'}
            </button>
          </div>
        </AnchorableHeading>

        {this.state.expanded && (
          <div className="object-synopsis__content">
            <div className="object-synopsis__content-description">
              {apiObject.text.length > 0 && (
                <MarkdownText>{apiObject.text}</MarkdownText>
              )}
            </div>

            <PropertyListing tags={apiObject.schema} />
          </div>
        )}
      </div>
    );
  },

  toggle() {
    this.setState({ expanded: !this.state.expanded });
  }
});

module.exports = APIObject;