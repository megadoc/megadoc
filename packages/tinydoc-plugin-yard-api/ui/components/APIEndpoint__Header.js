const React = require('react');
const AnchorableHeading = require('components/AnchorableHeading');
const { string, bool, shape, } = React.PropTypes;

const Header = React.createClass({
  propTypes: {
    anchor: string,
    showEndpointPath: bool,
    isBeta: bool,
    tag: shape({
      text: string,
    }),
    path: string,
  },

  getDefaultProps() {
    return {
      isBeta: false
    };
  },

  render() {
    var { tag } = this.props;

    return (
      <AnchorableHeading level="3" className="api-endpoint__header" href={this.props.anchor}>
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
      </AnchorableHeading>
    );
  }
});

module.exports = Header;