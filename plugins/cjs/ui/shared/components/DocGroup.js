var React = require('react');
var classSet = require('utils/classSet');

var DocGroup = React.createClass({
  mixins: [],

  propTypes: {
    tagName: React.PropTypes.string,
    docType: React.PropTypes.string,
    docs: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      tagName: 'div',
    };
  },

  render() {
    var { docType } = this.props;
    var DOMTag = this.props.tagName;
    var docs = docType ?
      this.props.docs.filter(function(doc) { return doc.ctx.type === docType; }) :
      this.props.docs
    ;

    var className;

    if (docs.length === 0) {
      return null;
    }

    className = classSet({
      'doc-group': true
    }, this.props.className);

    return (
      <div className={className}>
        <h2 className="doc-group__header">
          {this.props.children}
        </h2>

        <DOMTag className={this.props.listClassName}>
          {docs.map(this.renderItem)}
        </DOMTag>
      </div>
    );
  },

  renderItem(doc) {
    var id;
    var Renderer = this.props.renderer;

    if (Renderer.getKey instanceof Function) {
      id = Renderer.getKey(doc);
    }
    else {
      if (doc.symbol) {
        id = doc.symbol + doc.name;
      }
      else {
        id = doc.name;
      }
    }

    return (
      <Renderer
        key={id}
        ref={id}
        {...this.props.itemProps}
        {...doc}
      />
    );
  },

  getItem(id) {
    return this.refs[id];
  }
});

module.exports = DocGroup;