const React = require('react');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const AppState = require('core/AppState');
const classSet = require('utils/classSet');
const URIjs = require('urijs');
const navigate = require('../../utils/navigate');
const { string, func, node, bool, oneOfType, shape, } = React.PropTypes;
const { findDOMNode } = require('react');

const Link = React.createClass({
  propTypes: {
    to: shape({
      meta: shape({
        href: string.isRequired,
        anchor: string
      }).isRequired
    }),
    href: string,
    id: string,
    name: string,
    title: string,
    onClick: func,
    className: string,
    children: node,
  },

  render() {
    const href = this.getHref();
    const anchor = this.getAnchor(href) || '';

    if (AppState.inSinglePageMode() && !anchor.length) {
      console.warn(
        `You are linking to '${href}' but have not specified any anchor. ` +
        "An anchor is required for links to function in SinglePageMode."
      );
    }

    // blurgh, what?
    const isActive = this.isActive(href);
    const targetHref = anchor.length > 0 && AppState.inSinglePageMode() && href.indexOf('#') === -1 ?
      href + '#' + anchor :
      href
    ;

    // console.warn("Target URL = '%s', current URL = '%s', relative URL = '%s'",
    //   this.props.to,
    //   DocumentURI.getCurrentPathName(),
    //   RelativeHref(this.props.to)
    // );

    return (
      <a
        id={this.props.id}
        name={this.props.name}
        title={this.props.title}
        href={RelativeHref(targetHref)}
        onClick={this.navigate}
        children={this.props.children}
        className={classSet(this.props.className, { 'active' : isActive })}
      />
    );
  },

  navigate(e) {
    navigate(e, findDOMNode(this));

    if (this.props.onClick) {
      this.props.onClick(e);
    }
  },

  isActive(href) {
    const path = href.split('#')[0];

    // we need this for the http: protocol
    const pathWithoutOrigin = window.location.href.substr(window.location.origin.length);

    return (
      this.props.to === pathWithoutOrigin ||
      // this.. i have no idea anymore
      (path === this.props.to && Router.isActive(DocumentURI.withoutExtension(path)))
    )
  },

  getHref() {
    if (this.props.href) {
      return this.props.href;
    }
    else if (typeof this.props.to === 'string') {
      return this.props.to;
    }
    else if (this.props.to && typeof this.props.to === 'object') {
      return this.props.to.meta.href;
    }
  },

  getAnchor(href) {
    if (this.props.anchor) {
      return this.props.anchor;
    }
    else if (this.props.to && typeof this.props.to === 'object') {
      return this.props.to.meta.anchor;
    }
    else {
      return href.split('#')[1];
    }
  }
});

function RelativeHref(href) {
  try {
    return URIjs(href).relativeTo(DocumentURI.getCurrentPathName()).toString();
  }
  catch(e) {
    if (e.message === 'Cannot calculate a URI relative to another relative URI') {
      console.warn("Target URL = '%s', current URL = '%s'",
        href,
        DocumentURI.getCurrentPathName()
      );
    }

    throw e;
  }
}

module.exports = Link;
