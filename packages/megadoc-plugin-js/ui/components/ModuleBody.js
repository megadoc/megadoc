const React = require('react');
const { findWhere, where } = require("lodash");
const Outlet = require('components/Outlet');
const Link = require('components/Link');
const Doc = require('./Doc');
const ObjectSynopsis = require('./ObjectSynopsis');
const SeeTag = require('./Tags/SeeTag');
const DocGroup = require('./DocGroup');
const PropertyTag = require('./Tags/PropertyTag');
const ExampleTag = require('./Tags/ExampleTag');
const orderAwareSort = require('../utils/orderAwareSort');
const DocClassifier = require('../utils/DocClassifier');
const K = require('../constants');
const { string, object, arrayOf } = React.PropTypes;

const ModuleBody = React.createClass({
  propTypes: {
    documentNode: object,
    namespaceNode: object,
    doc: object,
    moduleDocs: arrayOf(object),
    focusedEntity: string,
  },

  render() {
    const { documentNode } = this.props;
    const doc = documentNode.properties;
    const moduleDocs = documentNode.entities.map(x => x.properties);
    const renderableType = DocClassifier.getDisplayType(documentNode);
    const mixedInTargets = getMixedInTargets(documentNode, this.props.namespaceNode);

    return (
      <div>
        {mixedInTargets.length > 0 && [
          <p key="mixinTargets__header" className="doc-group__header">
            This module is mixed-in by the following modules:
          </p>,

          <ol key="mixinTargets__listing">
            {mixedInTargets.map(x => (
              <li key={x.uid}>
                <Link to={x}>{x.title}</Link>
              </li>
            ))}
          </ol>
        ]}

        {renderableType === 'Factory' && (
          this.renderConstructor(doc, "Instance Constructor")
        )}

        {renderableType === 'Class' && (
          this.renderConstructor(doc, "Constructor")
        )}

        {renderableType === 'Function' && (
          this.renderConstructor(doc, "Signature")
        )}

        {this.renderExamples(doc)}
        {this.renderStaticMethods(doc, moduleDocs)}
        {this.renderCallbacks(doc, moduleDocs)}
        {this.renderTypeDefs(doc, moduleDocs)}
        {this.renderProperties(
          doc,
          moduleDocs,
          (scope) => !isStaticProperty(scope),
          "Instance Properties"
        )}

        {this.renderProperties(
          doc,
          moduleDocs,
          isStaticProperty,
          "Static Properties"
        )}

        {this.renderMethods(doc, moduleDocs)}
        {this.renderAdditionalResources(doc)}
      </div>
    );
  },

  renderConstructor(doc, title) {
    return (
      <div>
        <h2 className="doc-group__header">{title}</h2>

        <Doc
          withDescription={false}
          withExamples={false}
          withAdditionalResources={false}
          collapsible={false}
          doc={doc}
        />
      </div>
    );
  },

  renderExamples(doc) {
    const tags = where(doc.tags, { type: 'example' });

    return (
      <Outlet name="CJS::ExampleTags" elementProps={{tags}}>
        {tags.length === 1 && (this.renderExampleTag(tags[0]))}

        {tags.length > 1 && (
          <DocGroup label="Examples" alwaysGroup={false}>
            {tags.map(this.renderExampleTag)}
          </DocGroup>
        )}
      </Outlet>
    );
  },

  renderExampleTag(tag) {
    return (
      <Outlet
        key={tag.string}
        name="CJS::ExampleTag"
        elementProps={{
          tag,
          documentNode: this.props.documentNode
        }}
        firstMatchingElement
      >
        <ExampleTag string={tag.string} typeInfo={tag.typeInfo} />
      </Outlet>
    );
  },

  renderAdditionalResources(doc) {
    const tags = where(doc.tags, { type: 'see' });

    if (!tags.length) {
      return null;
    }

    return (
      <DocGroup label="Additional resources" className="class-view__sees" tagName="ul">
        {tags.map(this.renderSeeTag)}
      </DocGroup>
    );
  },

  renderSeeTag(tag) {
    return (
      <SeeTag key={tag.typeInfo.name} {...tag} />
    );
  },

  renderProperties(doc, moduleDocs, scope = null, title = 'Properties') {
    const propertyDocs = orderAwareSort(
      doc,
      moduleDocs.filter(function(entityDoc) {

        return (
          (scope ? scope(entityDoc.nodeInfo.scope) : true) &&
          (
            entityDoc.nodeInfo.type === K.TYPE_LITERAL ||
            entityDoc.tags.some(x => x.type === 'property')
          ) && entityDoc.symbol !== '~'
        );
      }),
      'id'
    );

    if (!propertyDocs.length) {
      return null;
    }

    return (
      <DocGroup label={title} tagName="div" className="js-doc-entity__property-tags">
        {propertyDocs.map(this.renderProperty)}
      </DocGroup>
    );
  },

  renderProperty(doc) {
    const tag = (
      findWhere(doc.tags, { type: 'property' }) ||
      findWhere(doc.tags, { type: 'type' }) || {
        typeInfo: {
          name: doc.name,
          type: { name: doc.type }
        }
      }
    );

    if (doc.type && doc.type === K.TYPE_OBJECT && !!tag.typeInfo.name) {
      return (
        <ObjectSynopsis
          key={doc.id}
          doc={doc}
          anchor={this.getEntityAnchor(doc)}
        />
      );
    }

    return (
      <PropertyTag
        key={doc.id}
        typeInfo={tag.typeInfo}
        anchor={this.getEntityAnchor(doc)}
        doc={doc}
      >
        {doc.type && doc.type === K.TYPE_FUNCTION && (
          <Doc
            withTitle={false}
            collapsible={false}
            doc={doc}
          />
        )}
      </PropertyTag>
    );
  },

  renderStaticMethods(doc, moduleDocs) {
    const staticMethodDocs = orderAwareSort(
      doc,
      moduleDocs.filter(DocClassifier.isStaticMethod),
      'id'
    );

    if (!staticMethodDocs.length) {
      return null;
    }

    return (
      <DocGroup label="Static Methods" tagName="ul" className="class-view__method-list">
        {staticMethodDocs.map(this.renderStaticMethod)}
      </DocGroup>
    );
  },

  renderCallbacks(doc, moduleDocs) {
    const callbackDocs = orderAwareSort(
      doc,
      moduleDocs.filter(DocClassifier.isCallback),
      'id'
    );

    if (!callbackDocs.length) {
      return null;
    }

    return (
      <DocGroup label="Callback Definitions" tagName="ul" className="class-view__method-list">
        {callbackDocs.map(this.renderStaticMethod)}
      </DocGroup>
    );
  },

  renderTypeDefs(doc, moduleDocs) {
    const typeDefDocs = orderAwareSort(
      doc,
      moduleDocs.filter(DocClassifier.isTypeDef),
      'id'
    );

    if (!typeDefDocs.length) {
      return null;
    }

    return (
      <DocGroup label="Type Definitions" tagName="ul" className="class-view__type-def-list">
        {typeDefDocs.map(typeDefDoc => {
          return (
            <Doc
              key={typeDefDoc.id}
              doc={typeDefDoc}
              anchor={this.getEntityAnchor(typeDefDoc)}
            >
              {typeDefDoc.tags.filter(x => x.type === 'property').map((tag, i) => {
                return (
                  <PropertyTag
                    key={i}
                    typeInfo={tag.typeInfo}
                  />
                )
              })}
            </Doc>
          )
        })}
      </DocGroup>
    );
  },

  renderStaticMethod(doc) {
    return (
      <Doc
        key={doc.id}
        doc={doc}
        anchor={this.getEntityAnchor(doc)}
      />
    );
  },

  renderMethods(doc, moduleDocs) {
    const methodDocs = orderAwareSort(
      doc,
      moduleDocs.filter(DocClassifier.isMethod),
      'id'
    );

    if (!methodDocs.length) {
      return null;
    }

    return (
      <DocGroup label="Instance Methods" tagName="ul" className="class-view__method-list">
        {methodDocs.map(this.renderMethod)}
      </DocGroup>
    );
  },

  renderMethod(doc) {
    return (
      <Doc
        key={doc.id}
        doc={doc}
        anchor={this.getEntityAnchor(doc)}
      />
    );
  },

  getEntityAnchor(doc) {
    return this.props.documentNode.entities.filter(x => x.properties === doc)[0].meta.anchor;
  },
});

function isStaticProperty(scope) {
  return [
    K.SCOPE_PROTOTYPE,
    K.SCOPE_INSTANCE
  ].indexOf(scope) === -1 || scope ;
}

function getMixedInTargets(node, namespaceNode) {
  const { uid } = node;

  return namespaceNode.documents.reduce(findMatchingDocuments, []);

  function findMatchingDocuments(list, documentNode) {
    if (match(documentNode)) {
      list.push(documentNode);
    }

    if (documentNode.documents) {
      documentNode.documents.reduce(findMatchingDocuments, list);
    }

    return list;
  }

  function match(x) {
    return (
      x.properties &&
      x.properties.mixinTargets &&
      x.properties.mixinTargets.some(y => y.uid === uid)
    );
  }
}

module.exports = ModuleBody;