const path = require('path');
const K = require('./constants');

module.exports = {
  /**
   * @property {String}
   *
   * An array of paths to files you want to copy to the output directory.
   * They will be found under `assets/` with their **full source path**.
   *
   * For example:
   *
   *     exports.assets = [ 'app/images/box.png' ];
   *
   * Will be found at:
   *
   *     /assets/app/images/box.png
   *
   */
  assets: [],

  /**
   * @property {Boolean}
   *
   * Whether to show a button for collapsing the sidebar.
   */
  collapsibleSidebar: false,

  compileCSS: true,

  /**
   * @property {Boolean}
   *
   * Whether we should generate .html files for every document.
   */
  emitFiles: true,
  emittedFileExtension: '.html',

  /**
   * @property {String}
   *
   * Path to where a favicon can be found. Clear this if you don't want any.
   */
  favicon: null,

  /**
   * @property {String}
   *
   * A small message (can be Markdown) to display at the bottom of the app.
   *
   * Set this to an empty string, or null, if you don't want the footer
   * to be shown.
   */
  footer: 'Made with &#9829; using [megadoc](https://github.com/megadoc).',

  htmlFile: path.join(K.ROOT, 'ui/index.tmpl.html'),

  redirect: {},

  /**
   * @property {Object}
   */
  layoutOptions: {
    /**
     * @property {Object.<String, String>}
     *
     * Override the default URL for certain documents. You must use [[UIDs | CorpusUIDs]]
     * to specify the documents you want to rewrite.
     *
     * @example
     *
     *     {
     *       "api/Cache": "/cache.html"
     *     }
     */
    rewrite: {},

    /**
     * @property {Boolean}
     *
     * Launch megadoc into "single-page" mode where you want to present all
     * the contents in a single page. This flag MUST be turned in order for
     * links to work online and offline.
     *
     * See the [guides/single-page-md Single Page Mode guide]() for more information.
     */
    singlePageMode: false,

    /**
     * @property {Array.<BannerLink>}
     *
     * @typedef {BannerLink}
     * @property {String} text
     * @property {String} href
     */
    bannerLinks: []
  },

  /**
   * @property {Boolean}
   *
   * Whether links to external sites should be opened in new tabs.
   */
  launchExternalLinksInNewTabs: true,

  linkResolver: {
    strategies: [ 'Megadoc', 'MediaWiki' ],
    ignore: {},
  },

  metaDescription: '',

  /**
   * @property {String}
   *
   * A brief sentence describing what this is about. It will be displayed right
   * next to the title in a small type.
   */
  motto: null,

  /**
   * @property {Boolean}
   *
   * Whether the side-bar should be resizable. Affects all
   * layouts that show a sidebar.
   */
  resizableSidebar: true,

  /**
   * @property {Boolean}
   *
   * Turn this on if you want the side-bar links to become
   * active as the user is scrolling the page.
   *
   * Only works when using the single page layout.
   */
  scrollSpying: false,

  spotlight: true,

  /**
   * @property {String}
   *
   * Absolute path to a .css or .less file to include in the CSS bundle.
   * If you provide a .less file, you can (re)use the variables that the
   * UI's stock stylesheets use.
   *
   * If you want to override the variables, say for custom branding,
   * look at the @styleOverrides parameter.
   *
   * Example:
   *
   *     exports.stylesheet = "doc/mega.less";
   *
   */
  styleSheet: null,

  /**
   * @property {String}
   *
   * Absolute path to a .less stylesheet file that re-defines variables
   * used in the stock UI's stylesheets. This allows for complete theming
   * without messing with the source files, or having to use !important
   * directives, etc.
   *
   * Example:
   *
   *     exports.styleOverrides = "doc/mega/overrides.less";
   *
   */
  styleOverrides: null,

  /**
   * @property {Object}
   *
   * Configuration for the syntax highlighter, which uses
   * [Prism.js](http://prismjs.com/).
   */
  syntaxHighlighting: {
    defaultLanguage: 'javascript',

    /**
     * @property {Array.<String>} syntaxHighlighting.languages
     *
     * A list of language definitions to enable highlighting for. This has to
     * map to Prism's available grammars, which you can find at http://prismjs.com/#languages-list.
     */
    languages: [
      'bash',
      'clike',
      'c',
      'javascript',
      'markdown',
      'ruby',
    ],

    /**
     * @property {Object.<String,String>} syntaxHighlighting.aliases
     *
     * A map of language names to alias. For example, if you're used to using
     * "shell" as a language but Prism only has "bash", this map allows you to
     * alias "bash" as "shell".
     */
    aliases: {
      'shell': 'bash'
    },

    /**
     * @property {Array.<Config~Template>}
     *
     * @typedef {Config~Template}
     *
     * A layout override configuration object. This object describes how to render
     * a certain page. By default, megadoc will compute a preferred layout based on
     * the type of document that is being rendered.
     *
     * @property {!Object} match
     *           The parameters that control when this configuration applies.
     *
     * @property {("url"|"uid"|"type"|"namespace")} match.by
     *           What we should match on.
     *
     * @property {String} match.on
     *           The value for matching:
     *
     *           - If `match.by` was set to `url`, this would be the URL(s) of the
     *           pages.
     *           - If `match.by` was set to `uid`, this would be the corpus UIDs
     *           of the documents.
     *           - If `match.by` was set to `type`, this would be the corpus ADT
     *           node type. See [[T]].
     *
     * @property {?String} using
     * @property {Array.<Config~TemplateRegion>} regions
     *
     * @typedef {Config~TemplateRegion}
     *
     * A configuration object for a specific layout region.
     *
     * @property {!String} name
     *           The name of the region. See [[Layout]] for the regions it defines.
     *
     * @property {?Object} options
     *           Options to customize how the region looks like. Refer to each
     *           region's documentation to know what options it supports.
     *
     * @property {Array.<Config~TemplateRegionOutlet>} outlets
     *           The outlets to fill the region with.
     *
     * @typedef {Config~TemplateRegionOutlet}
     *
     * @property {!String} name
     * @property {?Object} options
     * @property {?String} using
     * @property {?("cascade"|"fix")} [injectionStrategy="cascade"]
     */
    customLayouts: null
  },

  tooltipPreviews: true,

  /**
   * @property {String}
   *
   * Starting window title.
   */
  title: "megadoc",

  theme: null,
};