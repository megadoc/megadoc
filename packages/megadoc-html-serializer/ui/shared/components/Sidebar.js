const React = require('react');
const classSet = require('utils/classSet');
const { PropTypes } = React;

const SidebarTree = React.createClass({
  propTypes: {
    children: PropTypes.node,
  },

  render() {
    return (
      <nav className="sidebar-tree">
        {this.props.children}
      </nav>
    );
  }
});

const SidebarList = React.createClass({
  propTypes: {
    children: PropTypes.node,
  },

  render() {
    return (
      <div className="sidebar-list">
        {this.props.children}
      </div>
    );
  }
});

const SidebarEntry = React.createClass({
  propTypes: {
    children: PropTypes.node,
    title: PropTypes.string,
  },

  render() {
    return (
      <div className="sidebar-entry">
        {this.props.children}
      </div>
    );
  }
});

const SidebarEntryLink = React.createClass({
  propTypes: {
    children: PropTypes.node,
    title: PropTypes.string,
  },

  render() {
    const child = React.Children.only(this.props.children);

    return (
      React.cloneElement(child, {
        className: classSet(child.props.className, 'sidebar-entry__link')
      })
    );
  }
});

exports.Tree = SidebarTree;
exports.Entry = SidebarEntry;
exports.EntryLink = SidebarEntryLink;
exports.List = SidebarList;
