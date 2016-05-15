var def = require('megadoc-corpus').Types.def;
var t = require('megadoc-corpus').Types.types;

def("MarkdownDocument", {
  base: "Document",
  fields: {
    fileName: t.string,
    filePath: t.string,
    folder: t.string,
    href: t.string,
    id: t.string,
    plainTitle: t.string,
    sections: t.arrayOf(t.shape({
      id: t.string,
      html: t.string,
      level: t.number,
      scopedId: t.string,
      text: t.string,
    })),
    sortingId: t.string,
    source: t.string,
    summary: t.string,
    title: t.string,
    wordCount: t.number,
  }
});
