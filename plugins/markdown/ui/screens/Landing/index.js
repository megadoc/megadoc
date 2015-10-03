const React = require('react');
const Article = require('../Article');

const { string, shape, object } = React.PropTypes;

const Landing = React.createClass({
  propTypes: {
    config: shape({
      homePage: string,
    }),

    database: object,
  },

  render() {
    const homePageId = this.props.config.homePage || 'README.md';
    const homePage = this.props.database.get(homePageId);

    if (homePage) {
      return (
        <Article
          {...this.props}
          params={{splat: homePageId }}
        />
      );
    }
    else {
      return (<div>Nothing to see here, move along!</div>);
    }
  }
});

module.exports = Landing;