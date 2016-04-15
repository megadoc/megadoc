const React = require('react');
const { uniq } = require('lodash');
const Link = require('components/Link');
const { shape, string, } = React.PropTypes;

module.exports = function(config) {
  return React.createClass({
    displayName: 'RelatedDocuments',
    propTypes: {
      document: shape({
        href: string.isRequired
      }),
    },

    render() {
      const href = this.props.document.href;
      const links = config.database
        .filter(x =>
          x.link.href === href &&
          // ignore self references
          x.source.href.indexOf(href) === -1
        )
        .map(x => x.source);

      if (!links.length) {
        return null;
      }

      return (
        <div>
          <h2>Related Documents</h2>
          <ul>
            {uniq(links, false, 'href').map(link =>
              <li key={link.href}>
                <Link to={"/" + link.href}>{link.title}</Link>
              </li>
            )}
          </ul>
        </div>
      )
    }
  });
};