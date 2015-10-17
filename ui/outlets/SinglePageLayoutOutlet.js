const React = require('react');
const { Link } = require('react-router');

const OutletManager = require('core/OutletManager');
const HomeScreen = require('../screens/Home');

module.exports = function(config) {
  OutletManager.add('SinglePageLayout::ContentPanel', {
    key: 'home',
    component: React.createClass({
      render() {
        return (
          <div>
            <header id="/" />
            <HomeScreen />
          </div>
        );
      }
    })
  });

  OutletManager.add('SinglePageLayout::Sidebar', {
    key: 'home',
    component: React.createClass({
      render() {
        return (
          <div>
            <h1>
              <Link to="home">
                {config.title}
              </Link>

            </h1>

            <ul className="">
              {config.readme.source.toc.map(this.renderSection)}
            </ul>
          </div>
        );
      },

      renderSection(section) {
        if (section.level < 1 || section.level > 2) {
          return null;
        }

        return (
          <li key={section.id}>
            <Link
              to="readme"
              params={{
                splat: '/' + section.scopedId
              }}
              children={section.text}
            />
          </li>
        );
      }
    }),
  });
};
