var React = require("react");
var DocEntity = require('components/DocEntity');
var MarkdownText = require('components/MarkdownText');
var SeeTag = require('components/DocTags/SeeTag');
var DocGroup = require('components/DocGroup');
var { where } = require("lodash");
var ExampleTag = require('components/DocTags/ExampleTag');
var JumperMixin = require('./mixins/JumperMixin');

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
    var exampleTags = where(doc.tags, { type: 'example' });
    var seeTags = where(doc.tags, { type: 'see' });

    return (
      <div>
        <MarkdownText>{doc.description.full}</MarkdownText>

        <h2 className="doc-group__header">Signature</h2>

        <DocEntity
          withDescription={false}
          withExamples={false}
          withAdditionalResources={false}
          collapsible={false}
          {...moduleDocs[0]}
        />

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
      </div>
    );
  }
});

module.exports = ClassView;