# Plugins

To use a plugin, simply add it to the `plugins` configuration array.

For example, to use the `cjs` plugin:

```javascript
// tinydoc.conf.js
exports.plugins = [
  require("tinydoc/plugins/cjs")
];
```
