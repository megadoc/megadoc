const React = require('react');
const Link = require('components/Link');
const TypeNames = require('../components/Tags/TypeNames');
const FunctionSignature = require('../components/FunctionSignature');
const DocClassifier = require('../utils/DocClassifier');
const { bool, object, } = React.PropTypes;

const ModuleIndex = React.createClass({
  propTypes: {
    documentNode: object,
    showFunctions: bool,
    showProperties: bool,
    showStaticMembers: bool,
  },

  getDefaultProps() {
    return {
      showFunctions: true,
      showProperties: true,
      showStaticMembers: true,
    };
  },

  render() {
    const { documentNode } = this.props;
    const memberFuctions = getByClassification(documentNode, [ DocClassifier.isMethod ]);
    const memberProperties = getByClassification(documentNode, [ DocClassifier.isMemberProperty ]);
    const staticMembers = getByClassification(documentNode, [
      DocClassifier.isStaticMethod,
      DocClassifier.isStaticProperty,
    ]);
    const others = getRemainingDocuments(documentNode, [
      staticMembers,
      memberFuctions,
      memberProperties
    ]);

    return (
      <div className="js-document-index">
        {memberFuctions.length > 0 && this.renderMethodGroup('Public Functions', memberFuctions)}
        {memberProperties.length > 0 && this.renderPropertyGroup('Public Properties', memberProperties)}
        {staticMembers.length > 0 && this.renderMethodGroup('Public Static Members', staticMembers)}
        {others.length > 0 && this.renderGroupByContextType('Other', others)}
      </div>
    );
  },

  renderGroupByContextType(title, documents) {
    return (
      <div>
        <h2 className="doc-group__header">
          {title}
        </h2>

        {this.renderGroup(documents)}
      </div>
    )
  },

  renderGroup(documents) {
    return (
      <table>
        <tbody>
          {documents.map(this.renderModuleSummaryRecord)}
        </tbody>
      </table>
    );
  },

  renderModuleSummaryRecord(node) {
    return (
      <tr key={node.uid}>
        <td>
          <Link to={node}>{node.properties ? node.properties.name : node.title}</Link>
        </td>

        <td>
          {node.summary || <em className="type-mute">No summary provided.</em>}
        </td>
      </tr>
    );
  },

  renderMethodGroup(title, documents) {
    return (
      <div>
        <h2 className="doc-group__header">
          {title}
        </h2>

        <table>
          <tbody>
            {documents.map(this.renderMethodSummaryRow)}
          </tbody>
        </table>
      </div>
    )
  },

  renderMethodSummaryRow(documentNode) {
    if (DocClassifier.isProperty(documentNode.properties)) {
      return this.renderPropertySummaryRow(documentNode);
    }

    const returnValue = documentNode.properties.tags.reduce((v, x) => {
      if (x.type === 'return') {
        return x.typeInfo.types;
      }
      else {
        return v;
      }
    }, ['void']);

    return (
      <tr key={documentNode.uid}>
        <td>
          <span className="doc-entity__function-signature">
            {returnValue && <TypeNames types={returnValue} />}
          </span>
        </td>

        <td>
          <Link to={documentNode} className="js-document-index__entity-name">
            {documentNode.properties.name}
          </Link>

          <FunctionSignature
            doc={documentNode.properties}
            withNames={false}
            withBraces
          />
        </td>
      </tr>
    )
  },

  renderPropertyGroup(title, documents) {
    return (
      <div>
        <h2 className="doc-group__header">
          {title}
        </h2>

        <table>
          <tbody>
            {documents.map(this.renderPropertySummaryRow)}
          </tbody>
        </table>
      </div>
    )
  },

  renderPropertySummaryRow(documentNode) {
    const propertyTag = documentNode.properties.tags.filter(x => x.type === 'property')[0];

    return (
      <tr key={documentNode.uid}>
        <td>
          <span className="doc-entity__function-signature">
            <TypeNames types={propertyTag.typeInfo.types} />
          </span>
        </td>

        <td>
          <Link to={documentNode} className="js-document-index__entity-name">
            {documentNode.properties.name}
          </Link>
        </td>
      </tr>
    )
  },
});

function getByClassification(documentNode, klassifiers) {
  return documentNode.entities.filter(x => {
    return klassifiers.some(fn => fn(x.properties));
  });
}

function getRemainingDocuments(documentNode, lists) {
  const usedUIDs = lists.reduce(function(map, list) {
    list.forEach(x => map[x.uid] = true);
    return map;
  }, {});

  return documentNode.entities.filter(x => !(x.uid in usedUIDs));
}

module.exports = ModuleIndex;
