const React = require('react');
const Link = require('components/Link');
const Sidebar = require('components/Sidebar');
const { sortBy } = require('lodash');
const { bool, object, } = React.PropTypes;

const Browser = React.createClass({
  propTypes: {
    params: object,
    namespaceNode: object.isRequired,
    documentNode: object,
    expanded: bool,
  },

  render() {
    return (
      <Sidebar.Tree>
        {sortBy(this.props.namespaceNode.documents, 'title').map(this.renderModule)}
      </Sidebar.Tree>
    );
  },

  renderModule(documentNode) {
    const { entities } = documentNode;
    const active = this.props.expanded || this.props.documentNode === documentNode;

    return (
      <Sidebar.Entry key={documentNode.uid}>
        <Sidebar.EntryLink>
          <Link
            to={documentNode}
            children={documentNode.title}
            title={documentNode.title}
          />
        </Sidebar.EntryLink>

        {active && entities.length > 0 && (
          <Sidebar.List>
            {entities.map(this.renderEntity)}
          </Sidebar.List>
        )}
      </Sidebar.Entry>
    );
  },

  renderEntity(documentNode) {
    return (
      <Sidebar.Entry key={documentNode.uid}>
        <Sidebar.EntryLink>
          <Link
            to={documentNode}
            children={documentNode.title}
            title={documentNode.title}
          />
        </Sidebar.EntryLink>
      </Sidebar.Entry>
    );
  }
});

module.exports = Browser;
