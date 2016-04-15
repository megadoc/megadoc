const React = require("react");
const Outlet = require('components/Outlet');
const HighlightedText = require('components/HighlightedText');
const Doc = require('components/Doc');
const SeeTag = require('components/Tags/SeeTag');
const DocGroup = require('components/DocGroup');
const PropertyTag = require('components/Tags/PropertyTag');
const { findWhere, where } = require("lodash");
const ExampleTag = require('components/Tags/ExampleTag');
const orderAwareSort = require('utils/orderAwareSort');
const DocClassifier = require('core/DocClassifier');
const Router = require('core/Router');
const K = require('constants');

function getRenderableType(doc, moduleDocs) {
  if (doc.ctx.type === K.TYPE_FUNCTION) {
    if (moduleDocs.some(DocClassifier.isFactoryExports)) {
      return K.TYPE_FACTORY;
    }
    else if (moduleDocs.some(DocClassifier.isClassEntity)) {
      return K.TYPE_CLASS;
    }
    else {
      return K.TYPE_FUNCTION;
    }
  }
  else {
    return K.TYPE_OBJECT;
  }
}

const { string, object, arrayOf } = React.PropTypes;

function isStaticProperty(scope) {
  return [ K.SCOPE_PROTOTYPE, K.SCOPE_INSTANCE ].indexOf(scope) === -1;
}

const ModuleBody = React.createClass({
  propTypes: {
    routeName: string.isRequired,
    doc: object,
    moduleDocs: arrayOf(object),
    focusedEntity: string,
  },

  render() {
    const { doc, moduleDocs } = this.props;
    const renderableType = getRenderableType(doc, moduleDocs);

    return (
      <div>
        <HighlightedText>{doc.description}</HighlightedText>

        {renderableType === K.TYPE_FACTORY && (
          this.renderConstructor(doc, "Instance Constructor")
        )}

        {renderableType === K.TYPE_CLASS && (
          this.renderConstructor(doc, "Constructor")
        )}

        {renderableType === K.TYPE_FUNCTION && (
          this.renderConstructor(doc, "Signature")
        )}

        {this.renderExamples(doc)}
        {this.renderStaticMethods(doc, moduleDocs)}
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
          "Properties"
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
      <Outlet name="CJS::ExampleTags" siblingProps={{ tags: doc.tags }} props={{tags}}>
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
        props={{ tag, routeName: this.props.routeName }}
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
      <SeeTag key={tag.string} string={tag.string} />
    );
  },

  renderProperties(doc, moduleDocs, scope = null, title = 'Properties') {
    const propertyDocs = orderAwareSort(
      doc,
      moduleDocs.filter(function(entityDoc) {
        return (
          (scope ? scope(entityDoc.ctx.scope) : true) &&
          where(entityDoc.tags, { type: 'property' }).length > 0
        );
      }),
      'id'
    );

    if (!propertyDocs.length) {
      return null;
    }

    return (
      <DocGroup label={title} tagName="ul">
        {propertyDocs.map(this.renderProperty)}
      </DocGroup>
    );
  },

  renderProperty(doc) {
    const tag = findWhere(doc.tags, { type: 'property' });
    const path = doc.ctx.symbol + doc.name;


    return (
      <PropertyTag
        key={path}
        typeInfo={tag.typeInfo}
        initiallyCollapsed={this.getActiveEntityId() !== path}
        path={path}
        parentPath={this.props.doc.name}
        anchorId={this.generateAnchorId(path)}
        doc={doc}
      />
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

  renderStaticMethod(doc) {
    const path = doc.ctx.symbol + doc.name;

    return (
      <Doc
        key={path}
        initiallyCollapsed={this.getActiveEntityId() !== path}
        doc={doc}
        anchorId={this.generateAnchorId(path)}
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
      <DocGroup label="Methods" tagName="ul" className="class-view__method-list">
        {methodDocs.map(this.renderMethod)}
      </DocGroup>
    );
  },

  renderMethod(doc) {
    const path = doc.ctx.symbol + doc.name;

    return (
      <Doc
        key={doc.id}
        initiallyCollapsed={this.getActiveEntityId() !== path}
        doc={doc}
        anchorId={this.generateAnchorId(path)}
      />
    );
  },

  generateAnchorId(path) {
    return Router.generateAnchorId({
      routeName: `${this.props.routeName}.module.entity`,
      params: {
        moduleId: this.props.doc.id,
        entity: path
      }
    });
  },

  getActiveEntityId() {
    return (
      this.props.focusedEntity ||
      decodeURIComponent(Router.getParamItem('entity'))
    );
  },
});

module.exports = ModuleBody;