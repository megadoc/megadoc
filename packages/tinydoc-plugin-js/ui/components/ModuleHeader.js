const React = require("react");
const Outlet = require('components/Outlet');
const Heading = require('components/Heading');
const HeadingAnchor = require('components/HeadingAnchor');
const K = require('../constants');
const DocClassifier = require('../utils/DocClassifier');

const { string, object, bool } = React.PropTypes;

const ModuleHeader = React.createClass({
  propTypes: {
    documentNode: object,
    showSourcePaths: bool,
    headerLevel: string,
    generateAnchor: bool,
    showNamespace: bool,
  },

  getDefaultProps() {
    return {
      headerLevel: '1',
      generateAnchor: true,
    };
  },

  shouldComponentUpdate(prevProps) {
    return prevProps.documentNode !== this.props.documentNode;
  },

  render() {
    let anchor;

    const { documentNode } = this.props;
    const doc = documentNode.properties || {
      name: documentNode.title,
      ctx: { type: K.TYPE_UNKNOWN }
    };

    if (this.props.generateAnchor) {
      anchor = documentNode.meta.anchor;
    }


    if (!doc.ctx) {
      return <header>Unsupported Entity</header>;
    }

    return (
      <header>
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
            {doc.name}
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
              name="CJS::ModuleHeader::Type"
              tagName="span"
              firstMatchingElement
              elementProps={this.props}
            >
              <span>{DocClassifier.getDisplayType(documentNode)}</span>
            </Outlet>
          </span>
        </Heading>
      </header>
    );
  }
});

module.exports = ModuleHeader;