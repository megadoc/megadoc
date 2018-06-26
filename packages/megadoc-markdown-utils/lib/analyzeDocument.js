const marked = require('marked')
const PlainTextRenderer = require('marked-plaintext')
const generateHeading = require('./generateHeading')

module.exports = markdownString => {
  const stats = {
    headings: [],
    summary: null,
    title: null,
    wordCount: 0,
  }

  const renderer = Object.assign({}, PlainTextRenderer.prototype, {
    heading: function(text, level) {
      stats.headings.push(generateHeading(text.trim(), level, stats.headings))
    },

    paragraph: function(text) {
      if (!stats.summary) {
        stats.summary = text
      }

      stats.wordCount += text.split(/\s/).length
    },

    text: function(text) {
      if (!stats.summary) {
        stats.summary = text
      }
    },

    br: () => '',
    image: () => '',
  })

  marked(markdownString, {
    gfm: true,
    tables: false,
    sanitize: false,
    breaks: false,
    linkify: false,
    pedantic: false,
    renderer
  })

  if (stats.summary) {
    stats.summary = decodeHTMLEntities(stats.summary)
  }

  if (stats.headings.length > 0 && stats.headings[0].level === 1) {
    stats.title = stats.headings[0].text;
  }

  return stats
}

function decodeHTMLEntities(string) {
  return string.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
}