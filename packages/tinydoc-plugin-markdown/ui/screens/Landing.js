const React = require('react');
const Article = require('./Article');
const Database = require('core/Database');

const { string, shape } = React.PropTypes;

const Landing = React.createClass({
  propTypes: {
    routeName: string,

    config: shape({
      homePage: string,
    }),
  },

  render() {
    const homePageId = this.props.config.homePage || 'README.md';
    const homePage = Database.for(this.props.routeName).get(homePageId);

    if (homePage) {
      return (
        <Article
          {...this.props}
          params={{ articleId: homePageId }}
        />
      );
    }
    else {
      return (<div>Nothing to see here, move along!</div>);
    }
  }
});

module.exports = Landing;