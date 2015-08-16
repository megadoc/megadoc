var React = require("react");
var MarkdownText = require('components/MarkdownText');
var Properties = require('./Properties');

var APIObject = React.createClass({
  displayName: "APIObject",

  getInitialState: function() {
    return {
      expanded: true
    };
  },

  render() {
    const { props } = this;

    console.log(this.props.schema_tags);

    return (
      <div className="object-synopsis">
        <h3 className="object-synopsis__header" id={`${props.name}-api`}>
          <span className="object-synopsis__header-text">{props.name}</span>
          <button className="object-synopsis__toggler" onClick={this.toggle}>
            {this.state.expanded ? 'Hide' : 'Show'}
          </button>
        </h3>

        {this.state.expanded && (
          <div className="object-synopsis__content">
            <div className="object-synopsis__content-description">
              {props.description && props.description.length > 0 && (
                <MarkdownText>{props.description}</MarkdownText>
              )}
            </div>

            <Properties tags={this.props.schema_tags} />
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