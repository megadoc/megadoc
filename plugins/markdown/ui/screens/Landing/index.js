const React = require('react');
const Article = require('../Article');

const Landing = React.createClass({
  render() {
    const homePageId = this.props.config.homePage || 'README.md';
    const homePage = this.props.database.get(homePageId);

    if (homePage) {
      console.log('ok! going to homepage:', homePage);

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