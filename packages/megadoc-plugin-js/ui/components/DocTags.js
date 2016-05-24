var React = require('react');
var TagGroup = require('./Tags/TagGroup');
var ExampleTag = require('./Tags/ExampleTag');
var ParamTag = require('./Tags/ParamTag');
var SeeTag = require('./Tags/SeeTag');
var ThrowsTag = require('./Tags/ThrowsTag');
var ReturnTag = require('./Tags/ReturnTag');
var TabularTagGroup = require('./TabularTagGroup');
var { where } = require('lodash');

const HANDLED_TAGS = [
  'constructor',
  'class',
  'example',
  'param',
  'return',
  'throws',
  'see',
  'module',
  'protected',
  'private',
  'async',
  'memberOf',
  'static',
  'preserveOrder',
  'method',
  'namespace',
  'type',
  'property',
];

var DocTags = React.createClass({
  displayName: 'DocTags',

  propTypes: {
    tags: React.PropTypes.array,
    withExamples: React.PropTypes.bool,
    withAdditionalResources: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      tags: [],
      withExamples: true,
      withAdditionalResources: true
    };
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.tags !== nextProps.tags;
  },

  render() {
    var paramTags = where(this.props.tags, { type: 'param' });
    var returnTags = where(this.props.tags, { type: 'return' });
    var unhandledTags = this.props.tags.filter(function(tag) {
      return HANDLED_TAGS.indexOf(tag.type) === -1;
    });

    return (
      <div className="doc-entity__tags">
        <TabularTagGroup alwaysGroup tagName="div" tags={paramTags} renderer={ParamTag}>
          Parameters ({paramTags.length})
        </TabularTagGroup>

        <TabularTagGroup alwaysGroup tagName="div" tags={returnTags} tagType="return" renderer={ReturnTag}>
          {returnTags.length > 1 ? 'Return Values' : 'Return Value'}
        </TabularTagGroup>

        {this.props.withExamples && (
          <TagGroup tags={this.props.tags} tagType="example" renderer={ExampleTag}>
            Examples
          </TagGroup>
        )}

        <TagGroup alwaysGroup tagName="ul" tags={this.props.tags} tagType="throws" renderer={ThrowsTag}>
          <span className="type-attention">Exceptions</span>
        </TagGroup>

        {this.props.withAdditionalResources && (
          <TagGroup alwaysGroup tags={this.props.tags} tagType="see" renderer={SeeTag} tagName="ul">
            Suggested Reading
          </TagGroup>
        )}

        {unhandledTags.length > 0 && (
          unhandledTags.map(this.renderTagString)
        )}
      </div>
    );
  },

  renderTagString(tag) {
    return (
      <div key={tag.string} className="type-attention">
        <pre>{JSON.stringify(tag, null, 2)}</pre>
      </div>
    );
  }
});

module.exports = DocTags;