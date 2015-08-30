var React = require("react");
var DocEntity = require('components/DocEntity');
var MarkdownText = require('components/MarkdownText');
var SeeTag = require('components/DocTags/SeeTag');
var DocGroup = require('components/DocGroup');
var PropertyTag = require('components/DocTags/PropertyTag');
var { where, sortBy } = require("lodash");
var ExampleTag = require('components/DocTags/ExampleTag');
var JumperMixin = require('./mixins/JumperMixin');
const orderAwareSort = require('utils/orderAwareSort');

function isClassMethod(doc) {
  return !doc.isStatic && [ 'method', 'function' ].indexOf(doc.ctx.type) > -1;
}

function isStaticMethod(doc) {
  return doc.isStatic;
}

var ClassView = React.createClass({
  mixins: [ JumperMixin ],

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
    var { doc, moduleDocs } = this.props;
    var methodDocs = moduleDocs.filter(isClassMethod);
    var staticMethodDocs = moduleDocs.filter(isStaticMethod);
    var propertyDocs = moduleDocs.reduce(function(propertyDocs, moduleDoc) {
      return propertyDocs.concat(where(moduleDoc.tags, { type: 'property' }));
    }, []);

    var exampleTags = where(doc.tags, { type: 'example' });
    var seeTags = where(doc.tags, { type: 'see' });

    return (
      <div>
        <MarkdownText>{doc.description.full}</MarkdownText>

        <DocGroup
          ref="exampleGroup"
          className="class-view__examples"
          docs={exampleTags}
          renderer={ExampleTag}
          children="Examples"
        />

        <DocGroup
          ref="seeGroup"
          className="class-view__sees"
          docs={seeTags}
          renderer={SeeTag}
          children="Additional resources"
        />

        <DocGroup
          ref="propertyGroup"
          tagName="ul"
          className="class-view__properties"
          listClassName="class-view__property-list"
          docs={orderAwareSort(doc, propertyDocs, 'id')}
          renderer={PropertyTag}
          children="Properties"
        />

        <DocGroup
          ref="staticMethodGroup"
          tagName="ul"
          className="class-view__methods"
          listClassName="class-view__method-list"
          docs={orderAwareSort(doc, staticMethodDocs, 'id')}
          renderer={DocEntity}
          itemProps={{initiallyCollapsed: true}}
          children="Static Methods"
        />

        <DocGroup
          ref="methodGroup"
          tagName="ul"
          className="class-view__methods"
          listClassName="class-view__method-list"
          docs={orderAwareSort(doc, methodDocs, 'id')}
          renderer={DocEntity}
          itemProps={{initiallyCollapsed: true}}
          children="Methods"
        />
      </div>
    );
  }
});

module.exports = ClassView;