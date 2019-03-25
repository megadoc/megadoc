const React = require('react');
const classSet = require('utils/classSet');
const resolvePathname = require('utils/resolvePathname');
const { PropTypes } = React;
const { findDOMNode } = require('react-dom');

const Link = React.createClass({
  contextTypes: {
    corpus: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  },

  propTypes: {
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        meta: PropTypes.shape({
          href: PropTypes.string.isRequired
        }).isRequired
      })
    ]),
    href: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node,
    active: PropTypes.bool,
    activePattern: PropTypes.string,
  },

  render() {
    const href = this.getHref();
    const isActive = this.props.active || this.isActive(href) || (
      this.props.activePattern &&
      this.context.location.pathname.match(this.props.activePattern)
    );

    if (!href) {
      console.warn(
        `Link with text "${this.props.children}" has no resolvable destination... ` +
        `This most likely indicates a configuration error.`
      );
    }

    return (
      <a
        id={this.props.id}
        name={this.props.name}
        title={this.props.title}
        href={href && this.getRelativeHref(href) || undefined}
        onClick={this.navigate}
        children={this.props.children}
        className={classSet(this.props.className, {
          'active': isActive,
          'mega-link': true,
          'mega-link--active': isActive,
          'mega-link--functional': !!href,
          'mega-link--internal mega-link--broken': !href
        })}
      />
    );
  },

  navigate(e) {
    this.context.navigate(e, findDOMNode(this));

    if (this.props.onClick) {
      this.props.onClick(e);
    }
  },

  isActive(href) {
    const { to } = this.props;
    const { location } = this.context;

    // because as of 6.1.1 we started linking to Document and Namespace nodes
    // using both pathname and anchors, so we need to match either when testing
    // whether the node is active
    if (to && typeof to === 'object' && to.type !== 'DocumentEntity') {
      return (
        href === location.pathname + location.hash ||
        to.meta.href === location.pathname
      );
    }

    return (
      href === location.pathname ||
      href === location.pathname + location.hash
    );
  },

  getHref() {
    if (this.props.href) {
      return this.props.href;
    }
    else if (typeof this.props.to === 'string') {
      const node = this.resolveNode(this.props.to)

      if (node) {
        return node.meta.href
      }
      else {
        return null;
      }
    }
    else if (this.props.to && typeof this.props.to === 'object') {
      return this.props.to.meta.href
    }
  },

  getRelativeHref(href) {
    return resolvePathname(href, this.context.location.pathname);
  },

  resolveNode(id) {
    const { corpus } = this.context;

    return [ corpus.getByURI, corpus.getByFilePath, corpus.get ].reduce(function(found, f) {
      return found || f(id)
    }, null)
  }
});


module.exports = Link;
