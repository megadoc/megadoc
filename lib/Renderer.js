var marked = require('marked');
var _ = require('lodash');
var RendererUtils = require('./RendererUtils');
var renderHeading = require('./Renderer__renderHeading');
var CodeRenderer = require('./Renderer__renderCode');
var LinkRenderer = require('./Renderer__renderLink');
var assign = _.assign;
var NilOptions = Object.freeze({});

/**
 * Markdown to HTML renderer.
 *
 * @param {Object} config
 * @param {Boolean} config.layoutOptions.singlePageMode
 */
function Renderer(config) {
  var renderer = new marked.Renderer();
  var markedOptions = Object.freeze({
    renderer: renderer,
    gfm: true,
    tables: true,
    sanitize: true,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  var runState, runOptions;
  var inSinglePageMode = config.layoutOptions.singlePageMode;
  var codeBlockRenderers = {};
  var renderCode = CodeRenderer(config.syntaxHighlighting);
  var renderLink = LinkRenderer(config);

  function createRunState(options) {
    var baseURL = options.baseURL || '';

    return {
      toc: [],
      baseURL: inSinglePageMode ? baseURL : null,
      contextNode: options.contextNode
    };
  }

  function createRunOptions(options) {
    return { anchorableHeadings: !options || options.anchorableHeadings !== false };
  }

  // this could be heavily optimized, but meh for now
  renderer.heading = function(text, level) {
    return renderHeading(text, level, runState, runOptions);
  };

  renderer.link = renderLink;

  renderer.code = function(code, language) {
    if (codeBlockRenderers[language]) {
      return codeBlockRenderers[language](code, {
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
   * @param {Boolean} [options.withTOC=false]
   *        Turn this on if you want the ToC meta-data. The return value will
   *        be an object of the shape: `{ html: String, toc: Array.<Object> }`.
   *
   * @return {String|Object}
   *         The HTML.
   */
  var exports = function renderMarkdown(text, options) {
    var html, toc;

    options = options || NilOptions;
    runState = createRunState(options);
    runOptions = createRunOptions(options);

    html = marked(text, assign({}, markedOptions, {
      sanitize: options.sanitize !== false
    }));

    toc = runState.toc;

    if (options && options.trimHTML) {
      html = RendererUtils.trimHTML(html);
    }

    runState = createRunState(NilOptions);
    runOptions = createRunOptions(NilOptions);

    return options.withTOC ? { html: html, toc: toc } : html;
  };

  exports.withTOC = function(text, options) {
    return exports(text, assign({ withTOC: true }, options));
  };

  /**
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
  exports.addCodeBlockRenderer = function(language, handler) {
    codeBlockRenderers[language] = handler;
  };

  return exports;
}

module.exports = Renderer;
