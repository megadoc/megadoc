const React = require("react");
const Outlet = require('components/Outlet');
const Heading = require('components/Heading');
const HeadingAnchor = require('components/HeadingAnchor');
const HighlightedText = require('components/HighlightedText');
const K = require('../constants');
const DocClassifier = require('../utils/DocClassifier');
const { PropTypes } = React;

const ModuleHeader = React.createClass({
  propTypes: {
    documentNode: PropTypes.object,
    showSourcePaths: PropTypes.bool,
    headerLevel: PropTypes.string,
    generateAnchor: PropTypes.bool,
    showNamespace: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      headerLevel: '1',
      generateAnchor: true,
    };
  },

  // shouldComponentUpdate(prevProps) {
  //   return prevProps.documentNode !== this.props.documentNode;
  // },

  render() {
    let anchor;

    const { documentNode } = this.props;
    const doc = documentNode.properties || {
      name: documentNode.title,
      type: K.TYPE_UNKNOWN
    };

    if (this.props.generateAnchor) {
      anchor = documentNode.meta.anchor;
    }

    return (
      <div>
        <Heading
          level="1"
          parentLevel={this.props.headerLevel}
          className="class-view__header anchorable-heading"
          title={this.props.showSourcePaths ? doc.filePath : undefined}
          id={anchor}
        >
          {anchor && <HeadingAnchor.Anchor href={anchor} />}
          {anchor && <HeadingAnchor.Link href={anchor} />}

          <HeadingAnchor.Text className="class-view__header-name">
            <span>{doc.name}</span>
          </HeadingAnchor.Text>

          {' '}

          {this.props.showNamespace && doc.namespace && (
            <span className="class-view__header-namespace">
              {'{'}{doc.namespace}{'}'}
            </span>
          )}

          {' '}

          <span className="class-view__header-type">
            <Outlet
              name="JS::ModuleHeader::Type"
              tagName="span"
              firstMatchingElement
              elementProps={this.props}
            >
              <span>{DocClassifier.getDisplayType(documentNode)}</span>
            </Outlet>

            {hasMixinTargets(documentNode) && (
              documentNode.properties.mixinTargets
                .map(x => (
                  <span key={x.name}>, <span dangerouslySetInnerHTML={{__html: x.html || x.name}} /></span>
                ))
            )}

            {hasSuperClasses(documentNode) && (
              documentNode.properties.superClasses
                .map(x => (
                  <span key={x.name}>, <span dangerouslySetInnerHTML={{__html: x.html || x.name}} /></span>
                ))
            )}
          </span>
        </Heading>

        {this.props.showSourcePaths && documentNode.filePath && (
          <p className="class-view__module-filepath">
            Defined in: <code>{documentNode.filePath}</code>
          </p>
        )}

        <HighlightedText key="description">
          {doc.description}
        </HighlightedText>
      </div>
    );
  }
});

function hasMixinTargets(node) {
  return Boolean(
    node.properties &&
    node.properties.mixinTargets &&
    node.properties.mixinTargets.length > 0
  );
}

function hasSuperClasses(node) {
  return Boolean(
    node.properties &&
    node.properties.superClasses &&
    node.properties.superClasses.length > 0
  );
}

module.exports = ModuleHeader;