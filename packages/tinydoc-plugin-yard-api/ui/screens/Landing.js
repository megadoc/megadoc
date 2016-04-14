const React = require('react');
const scrollToTop = require('utils/scrollToTop');
const Outlet = require('components/Outlet');
const Document = require('components/Document');
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
      <Outlet name="yard-api::Landing" props={{ url: `/${this.props.baseURL}` }}>
        <Document>Welcome to the API docs!</Document>
      </Outlet>
    );
  }
});

module.exports = Landing;