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
    const exportedSymbols = getByClassification(documentNode, [ DocClassifier.isExportedSymbol ]);
    const staticMembers = getByClassification(documentNode, [
      DocClassifier.isStaticMethod,
      DocClassifier.isStaticProperty,
    ])

    const publicStaticMembers = staticMembers
      .filter(x => DocClassifier.isPublic(x.properties))
    ;

    const privateStaticMembers = staticMembers
      .filter(x => !DocClassifier.isPublic(x.properties))
    ;

    const others = getRemainingDocuments(documentNode, [
      staticMembers,
      memberFuctions,
      memberProperties,
      exportedSymbols
    ]);

    return (
      <div className="js-document-index">
        {exportedSymbols.length > 0 && this.renderExportedSymbols('Exported Symbols', exportedSymbols)}
        {memberFuctions.length > 0 && this.renderMethodGroup('Public Functions', memberFuctions)}
        {memberProperties.length > 0 && this.renderPropertyGroup('Public Properties', memberProperties)}
        {publicStaticMembers.length > 0 && this.renderMethodGroup('Public Static Members', publicStaticMembers)}
        {privateStaticMembers.length > 0 && this.renderMethodGroup('Private Static Members', privateStaticMembers)}
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
        return x.typeInfo.type;
      }
      else {
        return v;
      }
    }, { name: 'void' });

    return (
      <tr key={documentNode.uid}>
        <td>
          <span className="doc-entity__function-signature">
            {returnValue && <TypeNames type={returnValue} />}
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
            <TypeNames type={propertyTag.typeInfo.type} />
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

  renderExportedSymbols(title, documents) {
    return (
      <div>
        <h2 className="doc-group__header">
          {title}
        </h2>

        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Definition</th>
            </tr>
          </thead>

          <tbody>
            {documents.map(node => {
              const [ typeInfo ] = node.properties.tags.filter(x => x.type === 'export').map(x => x.typeInfo);

              return (
                <tr key={node.id}>
                  <td>{typeInfo.name || node.properties.name}</td>
                  <td><TypeNames type={typeInfo.type} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
});

function getByClassification(documentNode, klassifiers) {
  return documentNode.entities.filter(x => {
    return klassifiers.some(fn => fn(x.properties));
  });
}

function getRemainingDocuments(documentNode, lists) {
  const usedUIDs = lists.reduce(function(map, list) {
    list.forEach(x => {
      map[x.uid] = true;
    });

    return map;
  }, {});

  return documentNode.entities.filter(x => !(x.uid in usedUIDs));
}

module.exports = ModuleIndex;
