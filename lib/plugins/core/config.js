/**
 * @module Core.Config
 * @preserveOrder
 */
module.exports = {
  /**
   * @property {String} [assetRoot]
   *
   * Absolute path to the root directory from which all files should be located.
   * This is automatically set to the directory containing tinydoc.conf.js when
   * you run the compiler.
   */
  assetRoot: null,

  /**
   * @property {String} outputDir
   *
   * Path to where the built assets (index.html and friends) will be saved to.
   *
   * Note that most scanner plugins will implicitly use this path to save their
   * own assets so that they're accessible relative from the index.html entry
   * file.
   */
  outputDir: 'doc/compiled',

  /**
   * @property {String}
   *
   * Starting window title.
   */
  title: "tinydoc",

  metaDescription: 'A documentation parser and generator.',

  /**
   * @property {String}
   *
   * A brief sentence describing what this is about. It will be displayed right
   * next to the title in a small type.
   */
  motto: null,

  /**
   * @property {String}
   *
   * Path to where a favicon can be found. Clear this if you don't want any.
   */
  favicon: null,

  /**
   * @property {String} [readme]
   *
   * You can point this to a markdown (or text) file and it will be displayed
   * as the landing/home page.
   */
  readme: null,

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
   * > **DEPRECATED**
   * >
   * > This option is no longer supported in tinydoc 3.0+; Hash location is
   * > always used.
   *
   * Turn this off if you want to use the HTML5 History location, but then
   * you must ensure your server is configured to rewrite any URL that
   * doesn't match an actual file to /index.html so the router can take
   * care of it.
   */
  useHashLocation: true,

  /**
   * @property {String}
   *
   * > **DEPRECATED**
   * >
   * > This option is no longer supported in tinydoc 3.0+; all assets are
   * > included relative to the html file.
   *
   * The path at which the files will be hosted. A value of `/` means
   * all the tinydoc generated files will be found at `/*`, like `/index.html`
   * for example.
   *
   * If you're serving tinydoc from a sub-folder, like `/doc`, then you
   * should tune this parameter accordingly.
   */
  publicPath: "./",

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
   *     exports.stylesheet = "doc/tiny.less";
   *
   */
  stylesheet: null,

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
   *     exports.styleOverrides = "doc/tiny/overrides.less";
   *
   */
  styleOverrides: null,

  /**
   * @property {Boolean}
   *
   * Turn this on if you want to parse git stats for the README file,
   * like last commit date and the file's authors.
   */
  gitStats: false,

  /**
   * @property {String}
   *
   * A small message (can be Markdown) to display at the bottom of the app.
   *
   * Set this to an empty string, or null, if you don't want the footer
   * to be shown.
   */
  footer: 'Made with &#9829; using [tinydoc](https://github.com/tinydoc).',

  /**
   * @property {Object} hotness
   *
   * The "Hot Item" feature configuration.
   *
   * An item could be marked as "hot" if its last commit timestamp falls
   * within a certain interval you specify below. This is useful for
   * readers to easily tell which items have changed recently so that
   * they should check them out.
   */
  hotness: {
    /**
     * @property {Number} hotness.count
     *
     * The number of [interval] (like days or weeks) that we should consider
     * an item to be hot.
     */
    count: 1,

    /**
     * @property {days|weeks|months|years} hotness.interval
     *
     * The actual interval. Works with @count defined above.
     */
    interval: "weeks"
  },

  /**
   * @property {Object}
   *
   * disqus configuration if you want the ability for users to comment.
   * Get this stuff from https://disqus.com/.
   */
  disqus: {
    enabled: false,
    shortname: '',
    baseUrl: 'http://localhost'
  },

  /**
   * @property {Boolean}
   *
   * Whether links to external sites should be opened in new tabs.
   */
  launchExternalLinksInNewTabs: true,

  showSettingsLinkInBanner: true,

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
	 * Whether to show a button for collapsing the sidebar.
	 */
  collapsibleSidebar: false,

	/**
	 * @property {Boolean}
	 *
	 * Turn this on if you want the side-bar links to become
	 * active as the user is scrolling the page.
	 *
	 * Only works when using the single page layout.
	 */
  scrollSpying: false,

  layout: 'multi-page',

  spotlight: true,

  tooltipPreviews: true,
};
