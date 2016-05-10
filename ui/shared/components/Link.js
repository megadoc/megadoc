const React = require('react');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');
const classSet = require('utils/classSet');
const URIjs = require('urijs');
const { string, func, node, } = React.PropTypes;

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

    return (
      <a
        id={this.props.id}
        name={this.props.name}
        title={this.props.title}
        href={URIjs(this.props.to).relativeTo(DocumentURI.getCurrentPathName()).toString()}
        onClick={this.props.onClick}
        children={this.props.children}
        className={classSet(this.props.className, { 'active' : isActive })}
      />
    );
  }
});

module.exports = Link;
