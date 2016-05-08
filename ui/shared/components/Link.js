const React = require('react');
const Router = require('core/Router');
const DocumentURI = require('core/DocumentURI');

const Link = React.createClass({
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
        href={this.props.to}
        onClick={this.navigate}
        children={this.props.children}
        className={isActive ? 'active' : undefined}
      />
    );
  },

  navigate(e) {
    if (isLeftClickEvent(e) && !isModifiedEvent(e)) {
      e.preventDefault();
      e.stopPropagation();

      Router.transitionTo(this.props.to);

      if (this.props.to.indexOf('#')) {
        Router.refresh();
        Router.refreshScroll();
      }

      if (this.props.onClick) {
        this.props.onClick(e);
      }
    }
  }
});

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

module.exports = Link;
