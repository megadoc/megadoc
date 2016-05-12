const React = require('react');
const { where } = require('lodash');

const TagGroup = React.createClass({
  propTypes: {
    tags: React.PropTypes.array,
    tagName: React.PropTypes.string,
    renderer: React.PropTypes.func,
    className: React.PropTypes.string,
    children: React.PropTypes.any,
  },

  render() {
    const tags = where(this.props.tags, { tag_name: this.props.tagName });
    const Renderer = this.props.renderer;

    if (tags.length === 0) {
      return null;
    }

    return (
      <div className={this.props.className}>
        {this.props.children}

        {tags.map(function(tag, i) {
          return <Renderer key={i} {...tag} />;
        })}
      </div>
    );
  }
});

module.exports = TagGroup;