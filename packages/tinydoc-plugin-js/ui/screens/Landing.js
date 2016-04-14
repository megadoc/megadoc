const React = require('react');
const scrollToTop = require('utils/scrollToTop');
const Outlet = require('components/Outlet');

const Landing = React.createClass({
  propTypes: {
    routeName: React.PropTypes.string,
  },

  componentDidMount() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
        <Outlet
          name="CJS::Landing"
          props={{ url: `/${this.props.routeName}` }}
        >
          <div>Hi! Is JavaScript time!</div>
        </Outlet>
      </div>
    );
  }
});

module.exports = Landing;