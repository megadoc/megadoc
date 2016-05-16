/**
 * @module Config
 */
module.exports = {
  /**
   * A unique identifier for the plugin. This identifier will also be
   * used as a baseURL unless you [@baseURL specify it]().
   */
  id: 'articles',

  /**
   * The title is displayed in certain contexts like the [Spotlight]().
   * It should be descriptive but very brief.
   */
  title: 'Articles',

  /**
   * The base URL to serve the documents from.
   *
   * A value of `/docs` would make a document file called `README.md` be
   * reachable at `/docs/readme.html`.
   */
  baseURL: null,

  /**
   * @type {Array.<String>}
   * Patterns to locate the source files.
   */
  source: [ 'doc/**/*.md' ],

  /**
   * @type {Array.<String>}
   *
   * Patterns to _exclude_ files that were matched by [@source]().
   */
  exclude: [],

  /**
   * Turning this on will make the listing (sidebar or document index)
   * use the full path for folders, as opposed to their name.
   *
   * You should turn this on if your documents are nested within folders
   * that could get more than one level deep.
   */
  fullFolderTitles: true,

  /**
   * When displaying [fullFolderTitles full-folder titles](), this is the
   * symbol that will separate folders apart.
   *
   * For example, for a folder at `docs/support/tier1`, the title would be:
   *
   *     Docs - Support - Tier1
   *
   */
  fullFolderTitleDelimiter: ' - ',

  /**
   * Allow links to contain a leading "/".
   *
   * For example:
   *
   *     [/doc/foo.md]()
   *
   * Is equivalent to:
   *
   *     [doc/foo.md]()
   */
  allowLeadingSlashInLinks: true,

  /**
   * @property {Boolean}
   *
   * Should a document not have a primary heading (# Heading, or <h1 />)
   * then we will try to generate a heading for it using the file name
   * (a human-friendly version of it, that is.)
   */
  generateMissingHeadings: true,

  /**
   * @property {RegExp}
   *
   * A pattern for adjusting the names of documents. Useful if there is
   * a common leading or trailing string you do not want to end up showing
   * in the URL.
   */
  discardIdPrefix: null,

  /**
   * @property {Boolean}
   *
   * Whether the source file extension (like .md) should be omitted from
   * the name and URL. Note that even when this is true, links to filepaths
   * will still be functional.
   */
  discardFileExtension: true,
};