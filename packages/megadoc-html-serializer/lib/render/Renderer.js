var marked = require('marked');
var { trimHTML } = require('megadoc-markdown-utils');
var renderHeading = require('./Renderer__renderHeading');
var CodeRenderer = require('./Renderer__renderCode');
var LinkRenderer = require('./Renderer__renderLink');
var NilOptions = ({});

/**
 * Markdown to HTML renderer.
 *
 * @param {Object} config
 *
 * @typedef {Renderer~CodeBlockRenderer}
 *
 * Install a handler for a certain language code-block. The handler is
 * expected to return **VALID, FULL HTML**.
 *
 * @param {String} language
 *        The language the renderer is expecting to handle.
 *
 * @param {Function} handler
 *        The rendering routine.
 *
 * @example Installing a handler for a custom "dot" language:
 *
 *     Renderer.addCodeBlockRenderer("dot", function(code) {
 *       return '<pre>' + code + '</pre>';
 *     });
 */
function Renderer(config) {
  var renderer = new marked.Renderer();
  var markedOptions = ({
    renderer: renderer,
    gfm: true,
    tables: true,
    sanitize: true,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  var runState, runOptions;
  var renderCode = CodeRenderer(config.syntaxHighlighting);
  var renderLink = LinkRenderer(config, () => runState.contextNode);

  function createRunState(options) {
    return {
      headings: [],
      baseURL: null,
      contextNode: options.contextNode
    };
  }

  function createRunOptions(options) {
    return {
      anchorableHeadings: options.anchorableHeadings !== false,
      codeBlockRenderers: options.codeBlockRenderers || NilOptions,
    };
  }

  // this could be heavily optimized, but meh for now
  renderer.heading = function(text, level) {
    return renderHeading(text, level, runState, runOptions);
  };

  renderer.link = renderLink;

  renderer.code = function(code, language) {
    if (runOptions.codeBlockRenderers[language]) {
      return runOptions.codeBlockRenderers[language]({
        text: code,
        contextNode: runState.contextNode
      });
    }
    else {
      return renderCode(code, language);
    }
  };

  /**
   * @method renderMarkdown
   *
   * Render Markdown to HTML.
   *
   * @param {String} text
   *        Markdown text.
   *
   * @param {Object} options
   * @param {String} [options.baseURL=null]
   *        The url to prefix the anchor links with. This is necessary only in
   *        the Single Page Mode because all anchors must be absolute then. In
   *        the regular mode, the anchors are shortened to be more friendly
   *        since they assume there won't be conflicts (because each "page" is
   *        expected to represent a single document.)
   *
   *        Pass the documentNode's @meta.href value here if you're compiling
   *        from a corpus node.
   *
   * @param {Boolean} [options.anchorableHeadings=true]
   *        Turn this off if you do not want the headings to have anchors -
   *        the [name] attribute and the .anchorable-heading stuff.
   *
   * @return {String|Object}
   *         The HTML.
   */
  function renderMarkdown({
    text,
    trimHTML: shouldTrimHTML = false,
    sanitize: shouldSanitize = true,
    contextNode,
    anchorableHeadings = true,
    codeBlockRenderers
  }) {
    var html;

    runState = createRunState({ contextNode });
    runOptions = createRunOptions({
      anchorableHeadings,
      codeBlockRenderers
    });

    html = marked(text, Object.assign({}, markedOptions, {
      sanitize: shouldSanitize !== false
    }));

    if (shouldTrimHTML) {
      html = trimHTML(html);
    }

    runState = createRunState(NilOptions);
    runOptions = createRunOptions(NilOptions);

    return html;
  };

  return renderMarkdown;
}

module.exports = Renderer;
