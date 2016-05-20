var nomnoml = require('nomnoml');
var RE_MEGADOT = Object.freeze(/mega\:\/\/([^\s\]]+)(?:\s*\as\s{1,}"(.+?)")?/g);

module.exports = function(compiler, config) {
  var state, injector;
  var sharedDirectives = [
    '#fontSize: 10',
    '#font: Monospace',
    '#lineWidth: 1',
    '#fill: #f4f4f4',   // TODO: use styleOverride / VARIABLE
    '#stroke: #404244', // TODO: use styleOverride / VARIABLE
    ''
  ].join('\n');

  if (config.allowLinks) {
    state = [];
    injector = Injector(state);
    return renderCodeWithLinks;
  }
  else {
    return renderCode;
  }

  function renderCode(code) {
    return wrapSVG(nomnoml.renderSvg(sharedDirectives + code));
  }

  function renderCodeWithLinks(code, params) {
    var src = compiler.linkResolver.linkify({
      text: sharedDirectives + code,
      injectors: [ injector ],
      format: 'html',
      contextNode: params.contextNode
    });

    var svg = nomnoml.renderSvg(src);
    var links = Object.keys(state);

    while (links.length) {
      var path = links.shift();
      var markups = state[path];

      svg = replaceMany(svg, path, markups);

      delete state[path];
    }

    return wrapSVG(svg);
  };
};

function wrapSVG(svg) {
  return '<div class="plugin-dot__container">' + svg + '</div>';
}

function Injector(state) {
  return function(string, renderLink) {
    return string.replace(RE_MEGADOT, function(source, path, text) {
      var target = decodeURI(text || path);

      if (!state[target]) {
        state[target] = [];
      }

      state[target].push(renderLink({
        source: source,
        path: path,
        text: text,
        format: 'html'
      }));

      // console.log('Source to Path: "%s" => "%s" (%s):', source, path, text)

      return target;
    });
  }
}

function replaceMany(string, pattern, replacements) {
  var cursor = 0;
  var patternLength = pattern.length;
  var i = 0;

  while ((cursor = string.indexOf(pattern, cursor)) > -1) {
    if (!replacements[i]) {
      break;
    }

    if (string.slice(cursor + patternLength, cursor + patternLength + 7) === '</text>') {
      string = (
        string.substr(0, cursor) + // LHS
        replacements[i++] + // markup
        string.substr(cursor + patternLength) // RHS
      );
    }

    cursor += patternLength;
  }

  return string;
}
