var React = require('react');
var TagGroup = require('./DocTags/TagGroup');
var ExampleTag = require('./DocTags/ExampleTag');
var ParamTag = require('./DocTags/ParamTag');
var PropertyTag = require('./DocTags/PropertyTag');
var SeeTag = require('./DocTags/SeeTag');
var ThrowsTag = require('./DocTags/ThrowsTag');
var ReturnTag = require('./DocTags/ReturnTag');
var { where } = require('lodash');

var DocTags = React.createClass({
  displayName: 'DocTags',

  propTypes: {
    tags: React.PropTypes.array,
    showExamples: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      tags: [],
      showExamples: true
    };
  },

  render() {
    var paramTags = where(this.props.tags, { type: 'param' });
    var unhandledTags = this.props.tags.filter(function(tag) {
      return [
        'param',
        'return',
        'example',
        'throws',
        'see',
        'module',
        'protected',
        'private'
      ].indexOf(tag.type) === -1;
    });

    return (
      <div className="doc-entity__tags">
        <TagGroup alwaysGroup tagName="ol" tags={paramTags} renderer={ParamTag}>
          Parameters ({paramTags.length})
        </TagGroup>

        <TagGroup tagName="ol" tags={this.props.tags} tagType="return" renderer={ReturnTag}>
          Returns
        </TagGroup>

        {this.props.showExamples && (
          <TagGroup tags={this.props.tags} tagType="example" renderer={ExampleTag}>
            Examples
          </TagGroup>
        )}

        <TagGroup tagName="ul" alwaysGroup tags={this.props.tags} tagType="throws" renderer={ThrowsTag}>
          <span className="type-attention">Exceptions</span>
        </TagGroup>

        <TagGroup tags={this.props.tags} tagType="see" renderer={SeeTag}>
          Additional resources
        </TagGroup>

        {unhandledTags.length > 0 && unhandledTags.map(this.renderTag)}
      </div>
    );
  },

  renderTag(tag) {
    var key = tag.string.split(' ').slice(0, 4).join('_');
    var content;

    switch(tag.type) {
      case 'param':
        content = (
          <ParamTag key={key} {...tag} />
        );
      break;

      case 'return':
        content = (
          <ReturnTag key={key} {...tag} />
        );
      break;

      case 'example':
        content = <ExampleTag key={key} {...tag} />;
      break;

      case 'see':
        content = <SeeTag key={key} {...tag} />;
      break;

      case 'property':
        content = <PropertyTag key={key} {...tag} />;
      break;

      case 'class':
        content = null;
      break;

      default:
        content = (
          <div className="type-attention" key={key}>
            <pre>{JSON.stringify(tag, null, 2)}</pre>
          </div>
        );
    }

    return content;
  }
});

module.exports = DocTags;