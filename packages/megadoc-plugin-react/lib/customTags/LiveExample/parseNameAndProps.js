var babel = require('babel-core');
var t = require('babel-types');
var generate = require('babel-generator')['default'];

module.exports = function(srcCode) {
  var compiled = babel.transform(srcCode, {
    comments: false,
    code: false,
    ast: true,
    babelrc: false,
    presets: [ 'react' ]
  });

  if (!compiled.ast || !compiled.ast.program.body[0]) {
    console.warn("Unable to parse Live Example code");
    console.warn("Source code:\n", srcCode);

    return null;
  }

  // args are what's passed to React.createElement():
  //
  // 1. {string} name
  // 2. {object} props
  // 3. {any} [children]
  //
  //     React.createElement(Button, { title: 'foo' }, 'Click me');
  var args = compiled.ast.program.body[0].expression.arguments;

  var propNodes = [].concat(args[1].properties || []);

  if (args.length > 2) {
    var children = args.slice(2);

    propNodes.push(
      t.objectProperty(
        t.identifier('children'),
        children.length === 1 ? children[0] : t.arrayExpression(children)
      )
    );
  }

  var propsExpr = t.objectExpression(propNodes);
  var name;

  if (t.isIdentifier(args[0])) {
    name = args[0].name;
  }
  else if (t.isLiteral(args[0])) {
    name = args[0].value;
  }

  return {
    name: name,
    props: generate(propsExpr, {
      comments: false,
      compact: true,
      quotes: 'double',
      retainLines: false,
    }).code
  };
};