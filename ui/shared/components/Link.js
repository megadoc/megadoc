const React = require('react');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const classSet = require('utils/classSet');
const URIjs = require('urijs');
const navigate = require('../../utils/navigate');
const { string, func, node, bool, } = React.PropTypes;
const { findDOMNode } = require('react');

const Link = React.createClass({
  propTypes: {
    to: string,
    href: string,
    anchor: string,
    id: string,
    name: string,
    title: string,
    onClick: func,
    className: string,
    children: node,
  },

  render() {
    const href = this.props.href || this.props.to;
    const fragments = href.split('#');
    const anchor = this.props.anchor || fragments[1] || '';

    // blurgh, what?
    const isActive = this.isActive(fragments[0] /* forget the anchor */);

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
        href={RelativeHref(href)}
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

  isActive(path) {
    // we need this for the http: protocol
    const pathNameWithoutOrigin = window.location.href.substr(window.location.origin.length);

    return (
      this.props.to === pathNameWithoutOrigin ||
      // this.. i have no idea anymore
      (path === this.props.to && Router.isActive(DocumentURI.withoutExtension(path)))
    )
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
