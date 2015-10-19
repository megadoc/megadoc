var React = require('react');
var TagGroup = require('./Tags/TagGroup');
var ExampleTag = require('./Tags/ExampleTag');
var ParamTag = require('./Tags/ParamTag');
var SeeTag = require('./Tags/SeeTag');
var ThrowsTag = require('./Tags/ThrowsTag');
var ReturnTag = require('./Tags/ReturnTag');
var { where } = require('lodash');

const HANDLED_TAGS = [
  'constructor',
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
    var unhandledTags = this.props.tags.filter(function(tag) {
      return HANDLED_TAGS.indexOf(tag.type) === -1;
    });

    return (
      <div className="doc-entity__tags">
        <TagGroup alwaysGroup tagName="ol" tags={paramTags} renderer={ParamTag}>
          Parameters ({paramTags.length})
        </TagGroup>

        <TagGroup alwaysGroup tagName="ol" tags={this.props.tags} tagType="return" renderer={ReturnTag}>
          Returns
        </TagGroup>

        {this.props.withExamples && (
          <TagGroup tags={this.props.tags} tagType="example" renderer={ExampleTag}>
            Examples
          </TagGroup>
        )}

        <TagGroup alwaysGroup tagName="ul" tags={this.props.tags} tagType="throws" renderer={ThrowsTag}>
          <span className="type-attention">Exceptions</span>
        </TagGroup>

        {this.props.withAdditionalResources && (
          <TagGroup alwaysGroup tags={this.props.tags} tagType="see" renderer={SeeTag}>
            Additional resources
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