var React = require('react');
var config = require('config');
var { Link } = require('react-router');
var Icon = require('components/Icon');

var Header = React.createClass({
  propTypes: {
    showEndpointPath: React.PropTypes.bool,
    isBeta: React.PropTypes.bool,
    tag: React.PropTypes.shape({
      text: React.PropTypes.string,
    }),
    path: React.PropTypes.string,
    resourceId: React.PropTypes.string,
    scopedId: React.PropTypes.string,
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
      <h2 className="api-endpoint__header markdown-text__heading">
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

          {' '}

          <Link
            className="markdown-text__heading-anchor"
            to="api.resource"
            params={{ resourceId: this.props.resourceId }}
            query={{ endpoint: this.props.scopedId }}
            children={(<Icon className="icon-link" />)}
          />
        </div>
      </h2>
    );
  }
});

module.exports = Header;