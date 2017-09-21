const React = require('react');
const { shape, string, object } = React.PropTypes;
const Link = require('components/Link');

const LinkOutlet = React.createClass({
  contextTypes: {
    location: shape({
      pathname: string,
    }),
    corpus: object,
  },

  propTypes: {
    $outletOptions: shape({
      href: string,
      className:  string,
      to:  string,
      text: string.isRequired,
      title: string,
    }).isRequired,
  },

  render() {
    const options = this.props.$outletOptions;
    const linkAttrs = {
      title: options.title,
      className: options.className,
      children: options.text
    }

    if (options.to) {
      return <Link {...linkAttrs} to={this.resolveNode(options.to)} />
    }
    else {
      return <Link {...linkAttrs} href={options.href} />
    }
  },

  resolveNode(id) {
    const { corpus } = this.context;

    return [ corpus.getByURI, corpus.get ].reduce(function(found, f) {
      return found || f(id)
    }, null)
  }
});

module.exports = LinkOutlet