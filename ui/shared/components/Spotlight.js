const React = require('react');
const { debounce } = require('lodash');
const TokenSearcher = require('core/TokenSearcher');
const Link = require('components/Link');
const classSet = require('classnames');
const { func, arrayOf, shape, string, } = React.PropTypes;
const hasScrollIntoViewIfNeeded = typeof Element.prototype.scrollIntoViewIfNeeded === 'function';

const Spotlight = React.createClass({
  propTypes: {
    onChange: func, // emitted when a document has been selected and jumped to
    corpus: arrayOf(shape({
      $1: string,
      $2: string,
      $3: string,
      link: shape({
        href: string,
      })
    })),
  },

  getInitialState() {
    return {
      results: [],
      lastSearchTerm: '',
      cursor: 0
    };
  },

  componentWillMount() {
    this.searcher = TokenSearcher(this.props.corpus);
    this.debouncedSearch = debounce(this.searcher.search, 100);
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cursor !== this.state.cursor) {
      this.scrollSelectedIntoView();
    }
  },

  render() {
    const { results } = this.state;

    return (
      <div className="spotlight__wrapper">
        <div className="spotlight">
          <div className="spotlight__help">
            <span>
              Jump to a document
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
            onChange={this.search}
            className="spotlight__input"
            onKeyDown={this.navigate}
          />

          <ul className="spotlight__results" ref="scrollableWidget">
            {results.length === 0 && this.state.lastSearchTerm.length > 0 && (
              <li className="spotlight__result">Nothing matched your query. 😞</li>
            )}

            {results.map(this.renderResult)}
          </ul>
        </div>
      </div>
    );
  },

  renderResult(result, index) {
    const token = result.item;
    const href = token.link.href;

    return (
      <li
        key={href}
        className={classSet({
          "spotlight__result": true,
          "spotlight__result--active": this.state.cursor === index
        })
      }>
        <Link to={href} ref={`link__${index}`} onClick={this.props.onChange}>
          {token['$1']}
        </Link>
      </li>
    );

    // {highlight(token[result.matches[0].key], result.matches[0].indices)}
  },

  search(e) {
    this.setState({
      cursor: 0,
      lastSearchTerm: e.target.value,
      results: this.searcher.search(e.target.value)
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

      if (this.props.onChange) {
        this.props.onChange();
      }
    }
  },

  selectNext() {
    this.setState({
      cursor: this.state.cursor === this.state.results.length - 1 ? 0 : this.state.cursor + 1
    });

  },

  selectPrev() {
    this.setState({
      cursor: this.state.cursor === 0 ? this.state.results.length - 1 : this.state.cursor - 1
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
  }
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
