# Previewing documents in tooltips

```javascript
tinydoc.outlets.add("Inspector", {
  key: 'js',
  
  match(props) {
    return props.namespaceNode.id === "js";
  },

  render() {
    const { documentNode, namespaceNode } = this.props;

    return (
      <div>
        <div className="tooltip__title">
          {documentNode.id} (in {namespaceNode.corpusContext})
        </div>

        <p children={documentNode.summary} />
      </div>
    );
  }
});
```