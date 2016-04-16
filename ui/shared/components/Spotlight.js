const React = require('react');
const { debounce } = require('lodash');
const TokenSearcher = require('core/TokenSearcher');
const Link = require('components/Link');
const classSet = require('classnames');
const { func, arrayOf, shape, string, bool, } = React.PropTypes;
const hasScrollIntoViewIfNeeded = typeof Element.prototype.scrollIntoViewIfNeeded === 'function';

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
      const node = React.findDOMNode(this.refs.editingWidget);

      node.value = '@';
      this.search({ target: node });
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

            {showAllSymbols && this.props.symbols &&
              this.props.symbols.map(this.renderResult)
            }

            {!showAllSymbols && results.map(this.renderResult)}
          </ul>
        </div>
      </div>
    );
  },

  renderResult(token, index) {
    const href = token.link.href;
    const text = token.$1;

    return (
      <li
        key={href}
        className={classSet({
          "spotlight__result": true,
          "spotlight__result--active": this.state.cursor === index
        })
      }>
        <Link to={href} ref={`link__${index}`} onClick={this.props.onActivate}>
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
    if (symbols) {
      this.symbolSearcher = TokenSearcher(symbols);
    }
    else {
      this.symbolSearcher = null;
    }
  },

  proxyToDebouncedSearch(e) {
    this.debouncedSearch({ target: { value: e.target.value } });
  },

  search(e) {
    const term = e.target.value;
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
    if (e.keyCode === 40) {
      e.preventDefault();
      this.selectNext();
    }
    else if (e.keyCode === 38) {
      e.preventDefault();
      this.selectPrev();
    }
    else if (e.keyCode === 9) {
      e.preventDefault();

      if (e.shiftKey) {
        this.selectPrev();
      }
      else {
        this.selectNext();
      }
    }
    else if (e.keyCode === 13) {
      e.preventDefault();
      this.activateSelected();

      if (this.props.onActivate) {
        this.props.onActivate();
      }
    }
  },

  selectNext() {
    this.setState({
      cursor: this.state.cursor < this.state.results.length -1 ? this.state.cursor + 1 : 0
    });

  },

  selectPrev() {
    const { cursor } = this.state;
    const nextCursor = cursor > 0 ?
      cursor - 1 :
      Math.max(this.state.results.length + 1, 1) - 1
    ;

    console.debug('going to previous from %d to %d', cursor, nextCursor)

    this.setState({
      cursor: nextCursor
    });
  },

  scrollSelectedIntoView() {
    if (hasScrollIntoViewIfNeeded) {
      this.getSelectedDOMNode().scrollIntoViewIfNeeded();
    }
  },

  activateSelected() {
    this.getSelectedDOMNode().click();
  },

  getSelectedDOMNode() {
    return React.findDOMNode(this.refs[`link__${this.state.cursor}`]);
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
