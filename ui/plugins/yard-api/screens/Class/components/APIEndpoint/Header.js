var React = require('react');
var config = require('config');

var Header = React.createClass({
  propTypes: {
    showEndpointPath: React.PropTypes.bool,
    isBeta: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      showEndpointPath: config.showEndpointPath,
      isBeta: false
    };
  },

  render() {
    var { tag } = this.props;

    return (
      <h3 className="api-endpoint__header">
        <div className="api-endpoint__header-label">
          {tag.text}
          {this.props.isBeta && (
            <span className="api-endpoint__header-beta">
              BETA
            </span>
          )}

          {this.props.showEndpointPath && (
            <div className="api-endpoint__header-path">
              {this.props.path}
            </div>
          )}
        </div>
      </h3>
    );
  }
});

module.exports = Header;