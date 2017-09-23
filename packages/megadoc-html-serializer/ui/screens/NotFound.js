const React = require('react');
const { Outlet } = require('react-transclusion');

const { PropTypes } = React;

const NotFound = React.createClass({
  propTypes: {
    redirectUrl: PropTypes.string.isRequired,
  },

  render() {
    return (
      <Outlet name="Core::NotFound" elementProps={{ redirectUrl: this.props.redirectUrl }}>
        <div className="not-found">
          <p>
            Sorry! There's nothing here for you to see. This is likely a
            configuration error.
          </p>

          <div className="margin-tb-m">
            <a href={this.props.redirectUrl}>
              Go back.
            </a>
          </div>
        </div>
      </Outlet>
    );
  },
});

module.exports = NotFound;
