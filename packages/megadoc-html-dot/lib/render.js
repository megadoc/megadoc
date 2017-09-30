const nomnoml = require('nomnoml');
const defaults = require('./config');
const RE_MEGADOT = /mega\:\/\/([^\s\]]+)(?:\s*\as\s{1,}"(.+?)")?/g;

module.exports = function({ linkify, linter }, config, { text, contextNode }) {
  const directives = Object.assign({}, defaults.directives, config.directives);
  const sharedDirectives = Object.keys(directives).reduce(function(list, key) {
    return list.concat(`#${key}: ${directives[key]}`);
  }, []).concat('').join('\n')

  const state = [];

  const src = linkify({
    text: sharedDirectives + text,
    injectors: [ MegadotInjector(state) ],
    format: 'html',
    contextNode
  });

  let svg;

  try {
    svg = nomnoml.renderSvg(src);
  }
  catch (e) {
    linter.logError({
      message: `Syntax error in dot diagram`,
      loc: linter.locationForNode(contextNode)
    });

    return wrapSVG(
      `<pre><code>Diagram unavailable due to syntax error.\n${e.message}</code></pre>`
    );
  }

  const links = Object.keys(state);

  while (links.length) {
    const path = links.shift();
    const markups = state[path];

    svg = replaceMany(svg, path, markups);

    delete state[path];
  }

  return wrapSVG(svg);
};

function wrapSVG(svg) {
  return '<div class="plugin-dot__container">' + svg + '</div>';
}

function MegadotInjector(state) {
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
