exports.cjs = {
  source: '${ROOT}/**/*.js',
  exclude: null
};

exports.markdown = {
  source: '${ROOT}/**/*.js',
  exclude: null,

  navigationEntry: {
    enabled: true,
    title: 'Articles'
  },

  route: 'markdown'
};

exports['yard-api'] = {
  source: '${ROOT}/**/*.js',
  exclude: null,
  showEndpointPath: true
};

exports.ui = {
  /**
   * @property {String} outputDir
   *
   * Path to where the built assets (index.html and friends) will be saved to.
   *
   * Note that most scanner plugins will implicitly use this path to save their
   * own assets so that they're accessible relative from the index.html entry
   * file.
   */
  outputDir: '${ROOT}/doc/www',

  /**
   * @property {String} [readme]
   *
   * You can point this to a markdown (or text) file and it will be displayed
   * as the landing/home page.
   */
  readme: null,

  useHashLocation: true,

  publicPath: null,

  stylesheet: null,

  /**
   * @immutable
   * @property {String[]} publicModules
   *
   * A list of modules that will be available at runtime which reporter plugins
   * can utilize. These are usually React components or utility functions.
   *
   * The source modules live in `/app/shared`, and at run-time will be found in
   * the global variable `tinydocReact` with the same path relative to
   * `/app/shared`.
   *
   * @example Using the `components/MarkdownText` component in webpack and at runtime
   *
   *     var MarkdownText = require("tinydoc-react-reporter/app/shared/components/MarkdownText");
   *     var MyComponent = React.createClass({
   *       render() {
   *         return <MarkdownText>Hello **World**!</MarkdownText>;
   *       }
   *     });
   *
   * Now in your webpack build config, make sure to rewrite anything coming in
   * from `tinydoc-react-reporter/app/shared/$PATH` to `tinydocReact[$PATH]`,
   * so that at run-time the above require statement turns down to this:
   *
   *     var MarkdownText = tinydocReact['components/MarkdownText'];
   *
   * This is possible using other loaders like browserify and require.js, but
   * you'll have to figure out the config.
   */
  publicModules: Object.freeze([
    'actions/RouteActions',

    'core/Store',
    'core/Storage',
    'core/LinkResolver',

    'components/Button',
    'components/Checkbox',
    'components/Docstring',
    'components/EllipsifiedText',
    'components/Icon',
    'components/Label',
    'components/MarkdownText',
    'components/SortableTable',
    'components/TwoColumnLayout',
    'components/ResizablePanel',

    'utils/classSet',
    'utils/ellipsify',
    'utils/generateHref',
    'utils/scrollIntoView',
    'utils/findChildByType',
  ])
};