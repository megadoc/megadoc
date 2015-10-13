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

const ModuleBody = React.createClass({
  propTypes: {
    focusedEntity: React.PropTypes.string,
    doc: React.PropTypes.object,
    moduleDocs: React.PropTypes.arrayOf(React.PropTypes.object),
  },

  getDefaultProps: function() {
    return {
      focusedEntity: null
    };
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
        {this.renderAdditionalResources(doc)}
        {this.renderStaticMethods(doc, moduleDocs)}
        {this.renderProperties(
          doc,
          moduleDocs,
          (scope) => scope === K.SCOPE_INSTANCE,
          "Instance Properties"
        )}

        {this.renderProperties(
          doc,
          moduleDocs,
          (scope) => scope !== K.SCOPE_INSTANCE,
          "Properties"
        )}

        {this.renderMethods(doc, moduleDocs)}
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
        {tags.length > 0 && (
          <DocGroup label="Examples">
            {tags.map(this.renderExampleTag)}
          </DocGroup>
        )}
      </Outlet>
    );
  },

  renderExampleTag(tag) {
    return (
      <Outlet key={tag.string} name="CJS::ExampleTag" props={tag}>
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
      <DocGroup label="Additional resources" className="class-view__sees">
        {tags.map(function(tag) {
          return (
            <SeeTag key={tag.string} string={tag.string} />
          );
        })}
      </DocGroup>
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
    const path = doc.ctx.symbol + doc.id;

    return (
      <PropertyTag
        key={path}
        ref={path}
        typeInfo={tag.typeInfo}
        initiallyCollapsed
        expanded={this.props.focusedEntity === path}
        path={path}
        parentPath={this.props.doc.id}
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
    const path = doc.ctx.symbol + doc.id

    return (
      <Doc
        ref={path}
        key={path}
        initiallyCollapsed
        expanded={this.props.focusedEntity === path}
        doc={doc}
        path={path}
        parentPath={this.props.doc.id}
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
    const path = doc.ctx.symbol + doc.id;

    return (
      <Doc
        ref={path}
        key={doc.id}
        initiallyCollapsed
        expanded={this.props.focusedEntity === path}
        doc={doc}
        path={path}
        parentPath={this.props.doc.id}
      />
    );
  }
});

module.exports = ModuleBody;