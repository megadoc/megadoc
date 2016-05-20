# Overriding style variables

The [HTMLSerializer]() provides a set of pre-defined variables that control the
look and feel of the UI. These variables are maintained in [/ui/css/variables.less]().

In order for an override of those variables to be reflected in all stylesheets,
we must define our overrides ahead of the compilation time.

To do this, you must define a file at `[my-plugin]/ui/styleOverrides.json` 
and register it with the [Compiler@assets compiler's asset]() registry:

```javascript
// @file: my-plugin/lib/index.js
compiler.on('write', function(done) {
  compiler.assets.addStyleOverrides(require('../ui/styleOverrides'));
});
```

The file is a strict JSON map of variable names and their values. For example:

```json
// @file: my-plugin/ui/styleOverrides.json
{
  "link": "#ff0000"
}
```

With the above override, all links will now be colored red.