var React = require("react");
var DocEntity = require('components/DocEntity');
var MarkdownText = require('components/MarkdownText');
var MethodTag = require('components/DocTags/MethodTag');
var SeeTag = require('components/DocTags/SeeTag');
var DocGroup = require('components/DocGroup');
var scrollIntoView = require('utils/scrollIntoView');
var PropertyTag = require('components/DocTags/PropertyTag');
var { where, sortBy } = require("lodash");
var isClassMethod = require('utils/isClassMethod');
var ExampleTag = require('components/DocTags/ExampleTag');
var Icon = require('components/Icon');

var ClassView = React.createClass({
  propTypes: {
    focusedEntity: React.PropTypes.string,
    classDoc: React.PropTypes.object,
    classDocs: React.PropTypes.arrayOf(React.PropTypes.object),
    commonPrefix: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      focusedEntity: null
    };
  },

  componentDidMount: function() {
    this.jumpToEntity();
  },

  componentDidUpdate: function() {
    this.jumpToEntity();
  },

  render() {
    var { classDoc, classDocs } = this.props;
    var classMethodDocs = classDocs.filter(isClassMethod);

    var propertyTags = classDocs.reduce(function(tags, doc) {
      return tags.concat(where(doc.tags, { type: 'property' }));
    }, []);

    // constructor @example tags only
    var exampleTags = where(classDoc.tags, { type: 'example' });

    // constructor @see tags only
    var seeTags = where(classDoc.tags, { type: 'see' });

    return (
      <div className="class-view doc-content">
        <header>
          <h1 className="class-view__header-name">
            <Icon className="icon-cube" />
            {classDoc.ctx.name}
          </h1>

          <div className="class-view__module-filepath">
            Defined in: {classDoc.filePath.replace(this.props.commonPrefix, '')}
          </div>
        </header>

        {<MarkdownText>{classDoc.description.full}</MarkdownText>}

        <DocGroup
          ref="exampleGroup"
          className="class-view__examples"
          docs={exampleTags}
          renderer={ExampleTag}>
          Examples
        </DocGroup>

        <DocGroup
          ref="seeGroup"
          className="class-view__sees"
          docs={seeTags}
          renderer={SeeTag}>
          Additional resources
        </DocGroup>

        <DocGroup
          ref="propertyGroup"
          tagName="ul"
          className="class-view__properties"
          listClassName="class-view__property-list"
          docs={sortBy(propertyTags, 'id')}
          renderer={PropertyTag}>
          Properties
        </DocGroup>

        <DocGroup
          ref="methodGroup"
          tagName="ul"
          className="class-view__methods"
          listClassName="class-view__method-list"
          docs={sortBy(classMethodDocs, 'id')}
          renderer={DocEntity}
          itemProps={{initiallyCollapsed: true}}>
          Methods
        </DocGroup>
      </div>
    );
  },

  jumpToEntity() {
    var id = this.props.focusedEntity;

    if (!id) {
      return;
    }

    var foundAndScrolled = Object.keys(this.refs).some((groupKey) => {
      var child = this.refs[groupKey].getItem(id);

      if (child) {
        scrollIntoView(child.getDOMNode());

        if (child.expand) {
          child.expand();
        }

        return true;
      }
    });

    if (!foundAndScrolled) {
      console.warn('Unable to find class entity:', id);
    }
  }
});

module.exports = ClassView;