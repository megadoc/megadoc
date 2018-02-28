const React = require("react");
const Link = require('components/Link');
const Icon = require('components/Icon');
const classSet = require('utils/classSet');
const SectionTree = require('../SectionTree');
const { assign } = require('lodash');

const ArticleTOC = React.createClass({
  propTypes: {
    documentNode: React.PropTypes.object,
    documentEntityNode: React.PropTypes.object,
    flat: React.PropTypes.bool,
    grouped: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      collapsed: {}
    };
  },

  getDefaultProps() {
    return {
      flat: false
    };
  },

  render() {
    const sections = SectionTree(this.props.documentNode);
    const rootSections = sections.filter(x => x.root);
    const hasChildren = rootSections.some(branch => branch.children.length > 0)

    if (!hasChildren) {
      return null;
    }

    if (this.props.grouped) {
      return (
        <ul className="markdown-toc markdown-toc--flat">
          {this.renderNodeInBranch(sections, rootSections[0].node)}
        </ul>
      )
    }

    return (
      <div className="markdown-toc">
        {rootSections.map(this.renderTree.bind(null, sections))}
      </div>
    );
  },

  renderTree(tree, branch) {
    if (!branch.children.length) {
      return null;
    }

    return (
      <ul
        key={branch.node.uid}
        className={classSet("markdown-toc", {
          "markdown-toc--flat": this.props.flat && branch.root
        })}
      >
        {branch.children.map(this.renderNodeInBranch.bind(null, tree))}
      </ul>
    );
  },

  renderNodeInBranch(tree, node) {
    const children = tree.filter(x => x.node.uid === node.uid)[0];
    const collapsed = this.state.collapsed[node.uid];

    return (
      <li
        key={node.uid}
        className={classSet({
          'markdown-toc__entry': true,
          'markdown-toc__entry--collapsible': !!children,
          'markdown-toc__entry--collapsed': collapsed,
        })}
      >
        {children && (
          <Icon
            className={classSet({
              "icon-arrow-down": collapsed,
              "icon-arrow-right": !collapsed,
            })}
            onClick={this.collapse.bind(null, node.uid)}
          />
        )}

        <Link to={node} children={node.properties.text} />

        {children && !collapsed && (this.renderTree(tree, children))}
      </li>
    )
  },

  collapse(key) {
    this.setState({
      collapsed: assign({}, this.state.collapsed, {
        [key]: !this.state.collapsed[key]
      })
    });
  }
});

module.exports = ArticleTOC;