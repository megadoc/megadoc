const React = require('react');
const { findDOMNode } = require('react-dom');
const { debounce } = require('lodash');
const TokenSearcher = require('../TokenSearcher');
const Link = require('components/Link');
const classSet = require('classnames');
const { func, arrayOf, shape, string, bool, } = React.PropTypes;
const hasScrollIntoViewIfNeeded = (
  typeof window !== 'undefined' &&
  typeof window.Element !== 'undefined' &&
  typeof window.Element.prototype.scrollIntoViewIfNeeded === 'function'
);

const TokensPropType = arrayOf(shape({
  $1: string,
  $2: string,
  $3: string,
  link: shape({
    href: string,
  })
}));

const Spotlight = React.createClass({
  statics: {
    MAX_RESULTS: 15
  },

  propTypes: {
    onActivate: func, // emitted when a document has been selected and jumped to
    corpus: TokensPropType,
    symbols: TokensPropType,
    startInSymbolMode: bool,
  },

  getInitialState() {
    return {
      results: [],
      lastSearchTerm: '',
      cursor: 0
    };
  },

  componentWillMount() {
    this.debouncedSearch = debounce(this.search, 13);
    this.corpusSearcher = TokenSearcher(this.props.corpus);
    this.buildSymbolSearcher(this.props.symbols);
  },

  componentDidMount() {
    if (this.props.startInSymbolMode) {
      const node = findDOMNode(this.refs.editingWidget);

      node.value = '@';
      this.search('@');
    }
  },

  componentWillUpdate(nextProps) {
    if (nextProps.symbols !== this.props.symbols) {
      this.buildSymbolSearcher(nextProps.symbols);
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cursor !== this.state.cursor) {
      this.scrollSelectedIntoView();
    }
  },

  render() {
    const { results } = this.state;
    const inSymbolMode = this.state.lastSearchTerm.match(/^@/);
    const showAllSymbols = this.state.lastSearchTerm === '@';
    const displayableResults = this.getNavigatableResults();

    return (
      <div className="spotlight__wrapper">
        <div className="spotlight">
          <div className="spotlight__help">
            <span>
              {inSymbolMode ? 'Jump to a symbol' : 'Jump to a document'}
            </span>

            <div className="float--right">
              <div className="spotlight__help-entry">
                <strong>tab</strong> or <strong>↑</strong><strong>↓</strong> to navigate
              </div>

              {' '}

              <div className="spotlight__help-entry">
                <strong>↵</strong> to select
              </div>

              {' '}

              <div className="spotlight__help-entry">
                <strong>esc</strong> to dismiss
              </div>
            </div>
          </div>

          <input
            autoFocus
            type="text"
            onChange={this.proxyToDebouncedSearch}
            className="spotlight__input"
            onKeyDown={this.navigate}
            ref="editingWidget"
          />

          <ul className="spotlight__results" ref="scrollableWidget">
            {!showAllSymbols && results.length === 0 && this.state.lastSearchTerm.length > 0 && (
              <li className="spotlight__result">
                Nothing matched your query. 😞
              </li>
            )}

            {showAllSymbols && (this.props.symbols || []).length === 0 && (
              <li className="spotlight__result">
                No symbols were found for this document. 😞
              </li>
            )}

            {displayableResults.map(this.renderResult)}
          </ul>
        </div>
      </div>
    );
  },

  getNavigatableResults() {
    if (this.state.lastSearchTerm === '@') {
      return this.props.symbols || [];
    }
    else {
      return this.state.results;
    }
  },

  renderResult(token, index) {
    const href = token.link.href;
    const text = token.$1;

    return (
      <li
        key={href + (token.link.anchor || '')}
        className={classSet({
          "spotlight__result": true,
          "spotlight__result--active": this.state.cursor === index
        })
      }>
        <Link href={href} anchor={token.link.anchor} ref={`link__${index}`} onClick={this.props.onActivate}>
          <span dangerouslySetInnerHTML={{__html:
            text.replace(/^(\s+)/, x => Array(x.length+1).join('&nbsp;&nbsp;'))
          }} /> {token.link.context && (
            <em className="spotlight__result-context">
              {token.link.context}
            </em>
          )}
        </Link>
      </li>
    );
  },

  buildSymbolSearcher(symbols) {
    this.symbolSearcher = symbols ? TokenSearcher(symbols) : null;
  },

  proxyToDebouncedSearch(e) {
    this.debouncedSearch(e.target.value);
  },

  search(term) {
    const results = term.match(/^@/) && this.symbolSearcher ?
      this.symbolSearcher.search(term.slice(1)) :
      this.corpusSearcher.search(term).slice(0, Spotlight.MAX_RESULTS)
    ;

    this.setState({
      cursor: 0,
      lastSearchTerm: term,
      results: results
    });
  },

  navigate(e) {
    const { keyCode } = e;
    const superKey = e.ctrlKey || e.metaKey;

    if (keyCode === 40) { // KC_DOWN_ARROW
      e.preventDefault();
      this.selectNext();
    }
    else if (keyCode === 38) { // KC_UP_ARROW
      e.preventDefault();
      this.selectPrev();
    }
    else if (keyCode === 35 && superKey) { // KC_END
      e.preventDefault();
      this.selectLast();
    }
    else if (keyCode === 36 && superKey) { // KC_HOME
      e.preventDefault();
      this.selectFirst();
    }
    else if (keyCode === 9) { // KC_TAB
      e.preventDefault();

      if (e.shiftKey) {
        this.selectPrev();
      }
      else {
        this.selectNext();
      }
    }
    else if (keyCode === 13) { // KC_RETURN
      e.preventDefault();
      this.activateSelected();

      if (this.props.onActivate) {
        this.props.onActivate();
      }
    }
  },

  selectFirst() {
    const results = this.getNavigatableResults();

    if (results.length) {
      this.updateCursor(0);
    }
  },

  selectNext() {
    const results = this.getNavigatableResults();

    if (results.length) {
      this.updateCursor(this.state.cursor < results.length -1 ?
        this.state.cursor + 1 :
        0
      );
    }
  },

  selectPrev() {
    const results = this.getNavigatableResults();

    if (results.length) {
      this.updateCursor(this.state.cursor > 0 ?
        this.state.cursor - 1 :
        results.length - 1
      );
    }
  },

  selectLast() {
    const results = this.getNavigatableResults();

    if (results.length) {
      this.updateCursor(results.length - 1);
    }
  },

  updateCursor(newCursor) {
    if (this.state.cursor !== newCursor) {
      this.setState({ cursor: newCursor });
    }
  },

  scrollSelectedIntoView() {
    if (hasScrollIntoViewIfNeeded) {
      const selectedNode = this.getSelectedDOMNode();

      if (selectedNode) {
        selectedNode.scrollIntoViewIfNeeded();
      }
    }
  },

  activateSelected() {
    const selectedNode = this.getSelectedDOMNode();

    if (selectedNode) {
      selectedNode.click();
    }
  },

  getSelectedDOMNode() {
    return findDOMNode(this.refs[`link__${this.state.cursor}`]);
  },
});

// function highlight(term, matches) {
//   if (matches.length === 0) {
//     return term;
//   }

//   return matches.reduce(function(buffer, match, index) {
//     return buffer.concat([
//       // any leading characters that were not matched:
//       index === 0 && match[0] > 0 && { text: term.slice(0, match[0]) },

//       // the substring between the last match and this one:
//       index > 0 && matches[index-1][1] < match[0] &&
//         { text: term.slice(matches[index-1][1]+1, match[0]) },

//       // the match body
//       { text: term.slice(match[0], match[1] + 1), highlighted: true },

//       // add any trailing, non-matched characters
//       index === matches.length - 1 && match[1] < term.length &&
//         { text: term.slice(match[1]+1) },
//     ]);
//   }, []).filter(x => !!x).map(function(entry, index) {
//     return (
//       <span
//         key={`${entry.text}:${index}`}
//         className={entry.highlighted ? "spotlight__highlighted-term" : undefined}
//       >
//         {entry.text}
//       </span>
//     );
//   });
// }

module.exports = Spotlight;
