const React = require('react');
const { array, string, func, any } = React.PropTypes;

const TagGroup = React.createClass({
  propTypes: {
    tags: array,
    tagName: string,
    renderer: func,
    className: string,
    children: any,
  },

  render() {
    const tags = this.props.tags.filter(x => x.tag_name === this.props.tagName);
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