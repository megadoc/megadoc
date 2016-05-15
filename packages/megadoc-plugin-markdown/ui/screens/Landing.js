const React = require('react');
const Article = require('./Article');
const Database = require('../Database');
const scrollToTop = require('utils/scrollToTop');

const { string, shape } = React.PropTypes;

const Landing = React.createClass({
  propTypes: {
    routeName: string,

    config: shape({
      homePage: string,
    }),
  },

  componentDidMount() {
    scrollToTop();
  },

  render() {
    const homePageId = this.props.config.homePage || 'README.md';
    const homePage = Database.for(this.props.routeName).get(homePageId);

    if (homePage) {
      return (
        <div>
          <Article
            {...this.props}
            params={{ articleId: homePageId }}
          />
        </div>
      );
    }
    else {
      return (
        <div className="doc-content">
          Nothing to see here, move along!
        </div>
      );
    }
  }
});

module.exports = Landing;