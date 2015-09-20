const React = require("react");
const Doc = require('components/Doc');
const MarkdownText = require('components/MarkdownText');
const SeeTag = require('components/Tags/SeeTag');
const DocGroup = require('components/DocGroup');
const PropertyTag = require('components/Tags/PropertyTag');
const { findWhere, where } = require("lodash");
const ExampleTag = require('components/Tags/ExampleTag');
const LiveExampleTag = require('components/Tags/LiveExampleTag');
const orderAwareSort = require('utils/orderAwareSort');
const DocClassifier = require('core/DocClassifier');
const K = require('constants');
const SectionJumperMixin = require('mixins/SectionJumperMixin');

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
  mixins: [
    SectionJumperMixin(function() {
      const id = this.props.focusedEntity;

      if (id) {
        const item = this.refs[this.props.focusedEntity];

        if (item) {
          return item;
        }
        else {
          console.warn('waaah, unable to find entity to jump to:', id);
        }
      }
    })
  ],

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
        <MarkdownText>{doc.description}</MarkdownText>

        {renderableType === K.TYPE_FACTORY && (
          this.renderConstructor(doc, "Instance Constructor")
        )}

        {renderableType === K.TYPE_CLASS && (
          this.renderConstructor(doc, "Constructor")
        )}

        {renderableType === K.TYPE_FUNCTION ? (
          this.renderConstructor(doc, "Signature")
        ) : (
          null
        )}

        {this.renderExamples(doc)}
        {this.renderLiveExamples(doc)}
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

    if (!tags.length) {
      return null;
    }

    return (
      <DocGroup label="Examples">
        {tags.map(function(tag) {
          return (
            <ExampleTag key={tag.string} string={tag.string} />
          );
        })}
      </DocGroup>
    );
  },

  renderLiveExamples(doc) {
    const tags = where(doc.tags, { type: 'live_example' });

    if (!tags.length) {
      return null;
    }

    return (
      <DocGroup label="Live Examples">
        {tags.map(function(tag) {
          return (
            <LiveExampleTag
              key={tag.string}
              tag={tag}
            />
          );
        })}
      </DocGroup>
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
        {propertyDocs.map(function(entityDoc) {
          const tag = findWhere(entityDoc.tags, { type: 'property' });
          const path = entityDoc.ctx.symbol + entityDoc.id;

          return (
            <PropertyTag
              key={path}
              ref={path}
              typeInfo={tag.typeInfo}
            />
          );
        })}
      </DocGroup>
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
        {staticMethodDocs.map(function(staticMethodDoc) {
          const path = staticMethodDoc.ctx.symbol + staticMethodDoc.id

          return (
            <Doc
              ref={path}
              key={path}
              initiallyCollapsed
              doc={staticMethodDoc}
            />
          );
        })}
      </DocGroup>
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
        {methodDocs.map(function(methodDoc) {
          const path = methodDoc.ctx.symbol + methodDoc.id;

          return (
            <Doc
              ref={path}
              key={methodDoc.id}
              initiallyCollapsed
              doc={methodDoc}
            />
          );
        })}
      </DocGroup>
    );
  }
});

module.exports = ModuleBody;