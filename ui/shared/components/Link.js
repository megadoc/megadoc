const React = require('react');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const classSet = require('utils/classSet');
const URIjs = require('urijs');
const navigate = require('../../utils/navigate');
const { string, func, node, } = React.PropTypes;
const { findDOMNode } = require('react');

const Link = React.createClass({
  propTypes: {
    to: string,
    id: string,
    name: string,
    title: string,
    onClick: func,
    className: string,
    children: node,
  },

  render() {
    const path = this.props.to.split('#')[0];
    const isActive = (
      this.props.to === location.href.substr( location.origin.length ) ||
      (path === this.props.to && Router.isActive(DocumentURI.withoutExtension(path)))
    );

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
        href={RelativeHref(this.props.to)}
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
