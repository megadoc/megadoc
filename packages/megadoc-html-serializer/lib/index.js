const async = require('async');
const path = require('path');
const jsdom = require('jsdom');
const K = require('./constants');
const generateHTMLFile = require('./generateHTMLFile');
const FakeWindowContext = require('./FakeWindowContext');
const CorpusVisitor = require('./CorpusVisitor');
const DocumentFileEmitter = require('./DocumentFileEmitter');
const Assets = require('./Assets');
const AssetUtils = require('./AssetUtils');
const VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);
const MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);
const MegadocCorpus = require('megadoc-corpus');
const emitAssets = require('./emitAssets');
const generateRuntimeConfig = require('./generateRuntimeConfig');
const util = require('util')
const ConfigUtils = require('megadoc-config-utils');

const DefaultConfig = {
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

  htmlFile: path.resolve(__dirname, '../../../ui/index.tmpl.html'),

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

  tooltipPreviews: true,

  /**
   * @property {String}
   *
   * Starting window title.
   */
  title: "megadoc",

  theme: null,
};

function HTMLSerializer(compilerConfig, userSerializerOptions) {
  this.compilerConfig = {
    assetRoot: compilerConfig.assetRoot,
    outputDir: compilerConfig.outputDir,
    tmpDir: compilerConfig.tmpDir,
    verbose: compilerConfig.verbose,
    strict: compilerConfig.strict,
  };

  this.assetUtils = new AssetUtils(this.compilerConfig);
  this.config = Object.assign({}, DefaultConfig, userSerializerOptions);
  this.corpusVisitor = CorpusVisitor(this.config);

  this.state = {
    assets: null,
    dom: null,
    fakeWindowContext: null,
    ui: null,
    window: null,
  };
}

HTMLSerializer.prototype.start = function(compilations, done) {
  this.state.assets = createAssets(this, compilations);
  this.state.dom = jsdom.jsdom(generateHTMLFile({
    params: {
      scripts: [],
      styleSheets: [ K.STYLE_BUNDLE ],
    },
    sourceFile: this.config.htmlFile,
    assets: this.state.assets,
    distanceFromRoot: 0
  }), {
    url: 'http://localhost'
  });

  const window = this.state.dom.defaultView;

  this.state.window = window;
  this.state.fakeWindowContext = FakeWindowContext(window, global);
  this.state.fakeWindowContext.install();

  require(VENDOR_BUNDLE);

  this.state.fakeWindowContext.expose('webpackJsonp_megadoc', window.webpackJsonp_megadoc);
  this.state.fakeWindowContext.expose('console.debug', Function.prototype);

  // TODO DRY alert, see HTMLSerializer__write.js
  window.CONFIG = Object.assign(generateRuntimeConfig(this.config, this.state), {
    $static: {
      readyCallback: (ui) => {
        this.state.ui = ui;

        done();
      },
    },
  });

  require(MAIN_BUNDLE);

  this.state.fakeWindowContext.expose('megadoc', window.megadoc);

  window.megadoc.start();

  this.state.assets.pluginScripts.forEach(require);
};

HTMLSerializer.prototype.emitCorpusDocuments = function(compilations, done) {
  const corpus = MegadocCorpus.Corpus({
    strict: this.compilerConfig.strict,
    debug: this.compilerConfig.debug
  });

  corpus.visit(this.corpusVisitor);

  compilations.forEach(function(compilation) {
    const serializerOptions = compilation.processor.serializerOptions.html || {};

    compilation.renderedTree.meta.defaultLayouts = serializerOptions.defaultLayouts;

    corpus.add(compilation.renderedTree);
  });

  const corpusTree = corpus.toJSON();
  const emitDocumentFile = DocumentFileEmitter({
    assets: this.state.assets,
    assetUtils: this.assetUtils,
    corpus: corpusTree,
    htmlFile: this.config.htmlFile,
    ui: this.state.ui,
    verbose: this.compilerConfig.verbose,
  });

  const fileList = Object.keys(corpusTree);

  // TODO DRY alert, see HTMLSerializer__write.js
  Object.assign(this.state.window.CONFIG, {
    database: corpusTree,
  });

  this.state.window.megadoc.regenerateCorpus(corpusTree);

  emitAssets(
    Object.assign({}, this.config, {
      verbose: this.compilerConfig.verbose,
    }),
    {
      assets: this.state.assets,
      corpusTree: corpusTree,
      assetUtils: this.assetUtils,
    },
    function(err) {
      if (err) {
        return done(err);
      }
      else {
        async.eachSeries(fileList, emitDocumentFile, done);
      }
    }
  )
};

HTMLSerializer.prototype.stop = function(done) {
  this.state.fakeWindowContext.restore();
  this.state.assets.pluginScripts.concat([
    MAIN_BUNDLE,
    VENDOR_BUNDLE,
  ]).forEach(unloadModule);

  this.state = {};

  done();
};

module.exports = HTMLSerializer;

function unloadModule(fileName) {
  delete require.cache[require.resolve(fileName)];
}

function createAssets(serializer, compilations) {
  const assets = new Assets();
  const themeSpec = ConfigUtils.getConfigurablePair(serializer.config.theme);
  const themePlugin = themeSpec ? require(themeSpec.name) : {
    assets: null,
    pluginScripts: null,
    styleOverrides: null,
    styleSheets: null,
  };

  const { staticAssets, styleSheets, pluginScripts } = compilations.map(x => x.processor.serializerOptions.html || {}).reduce(function(map, options) {
    if (options.pluginScripts) {
      options.pluginScripts.forEach(x => map.pluginScripts.push(x));
    }

    if (options.styleSheets) {
      options.styleSheets.forEach(x => map.styleSheets.push(x));
    }

    if (options.assets) {
      options.staticAssets.forEach(x => map.staticAssets.push(x));
    }

    return map;
  }, {
    staticAssets: [].concat(
      serializer.config.assets || []
    ).concat(
      themePlugin.assets || []
    ),
    styleSheets: [
      K.CORE_STYLE_ENTRY,
      serializer.config.styleSheet || serializer.config.stylesheet
    ],
    pluginScripts: [],
  })

  assets.addStyleOverrides(createStyleOverrides(serializer.config, themePlugin));

  staticAssets.filter(isTruthy).forEach(x => { assets.add(x); });
  styleSheets.filter(isTruthy).forEach(x => { assets.addStyleSheet(x); });
  pluginScripts.filter(isTruthy).forEach(x => { assets.addPluginScript(x); });

  return assets;
}

function createStyleOverrides(config, themePlugin) {
  const styleOverrides = {};

  if (themePlugin && themePlugin.styleOverrides) {
    Object.assign(styleOverrides, themePlugin.styleOverrides);
  }

  if (config.styleOverrides) {
    Object.assign(styleOverrides, config.styleOverrides);
  }

  return styleOverrides;
}

function isTruthy(x) {
  return !!x;
}