const React = require('react');
const { omit } = require('lodash');
const PrecompiledText = React.createClass({
  propTypes: {
    tagName: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      tagName: 'span'
    };
  },

  render() {
    const { children, tagName } = this.props;
    const Tag = tagName;

    return (
      <Tag
        {...omit(this.props, 'children', 'tagName')}
        dangerouslySetInnerHTML={{__html: children}}
      />
    );
  }
});

module.exports = PrecompiledText;
