var React = require('react');
var config = require('config');
var { Link } = require('react-router');
var Icon = require('components/Icon');

var Header = React.createClass({
  propTypes: {
    anchorId: React.PropTypes.string,
    showEndpointPath: React.PropTypes.bool,
    isBeta: React.PropTypes.bool,
    tag: React.PropTypes.shape({
      text: React.PropTypes.string,
    }),
    path: React.PropTypes.string,
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
      <h2 id={this.props.anchorId} className="api-endpoint__header markdown-text__heading anchorable-heading">
        <div className="api-endpoint__header-label">
          <Link
            className="markdown-text__heading-anchor"
            to={this.props.anchorId}
            children={(<Icon className="icon-link" />)}
          />

          <span className="markdown-text__heading-title">
            {tag.text}
          </span>

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
      </h2>
    );
  }
});

module.exports = Header;