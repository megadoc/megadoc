var React = require("react");
var MarkdownText = require('components/MarkdownText');
var PropertyListing = require('./PropertyListing');

var APIObject = React.createClass({
  displayName: "APIObject",

  getInitialState: function() {
    return {
      expanded: true
    };
  },

  render() {
    const apiObject = this.props.object;

    return (
      <div className="object-synopsis">
        {this.props.anchor || null}

        <h3 className="object-synopsis__header" id={apiObject.id}>
          <span className="object-synopsis__header-text">{apiObject.title}</span>
          <button className="object-synopsis__toggler" onClick={this.toggle}>
            {this.state.expanded ? 'Hide' : 'Show'}
          </button>
        </h3>

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