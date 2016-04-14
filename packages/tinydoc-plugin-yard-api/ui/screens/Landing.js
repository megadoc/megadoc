const React = require('react');
const scrollToTop = require('utils/scrollToTop');
const Outlet = require('components/Outlet');
const { string } = React.PropTypes;

const Landing = React.createClass({
  propTypes: {
    baseURL: string,
  },

  componentDidMount() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
        <Outlet
          name="yard-api::Landing"
          props={{ url: `/${this.props.baseURL}` }}
        >
          <div>Welcome to the API docs!</div>
        </Outlet>
      </div>
    );
  }
});

module.exports = Landing;