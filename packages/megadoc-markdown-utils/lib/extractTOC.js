var marked = require('marked');
var renderHeading = require('./renderHeading');
var tocExtractor = TOCExtractor();

function extractTOC(markdown) {
  return tocExtractor(markdown);
}

function TOCExtractor() {
  var renderer = new marked.Renderer();

  var markedOptions = ({
    renderer: renderer,
    gfm: true,
    tables: false,
    sanitize: true,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  let runState;
  const runOptions = {};

  renderer.heading = function(text, level) {
    return renderHeading(text, level, runState, runOptions);
  };

  return function(markdown) {
    if (!markdown) {
      return null;
    }

    runState = { toc: [] }

    marked(markdown, markedOptions);

    const toc = runState.toc;

    runState = null;

    return toc;
  };
}

module.exports = extractTOC;
