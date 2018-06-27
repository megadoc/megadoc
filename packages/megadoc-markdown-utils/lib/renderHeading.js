const generateHeading = require('./generateHeading');
const RE_TEMPLATE_VARIABLE = /\{\{\s{1}([^\}]+)\s{1}\}\}/g

const template = string => params => (
  string.replace(RE_TEMPLATE_VARIABLE, function(match, key) {
    return params[key] || match
  })
)

const AnchorableHeadingTmpl = template(`
<h{{ level }} class="anchorable-heading">
  <a name="{{ id }}" class="anchorable-heading__anchor"></a>
  <a href="#{{ id }}" class="anchorable-heading__link icon icon-link"></a><span class="anchorable-heading__text">{{ text }}</span>
</h{{ level }}>`
);

const HeadingTmpl = template(`
<h{{ level }}>
  {{ text }}
</h{{ level }}>`
);

function renderHeading(text, level, state, runOptions) {
  const heading = generateHeading(text, level, state.headings)

  state.headings.push(heading)

  if (runOptions.anchorableHeadings && heading.id && heading.id.length) {
    return AnchorableHeadingTmpl({
      // we need to strip any leading # because in SinglePageMode all url
      // values will have that
      id: stripLeadingHash(heading.id),
      level: heading.level,
      text: heading.text,
    });
  }
  else {
    return HeadingTmpl({ level: heading.level, text: heading.text });
  }
};

function stripLeadingHash(x) {
  return x[0] === '#' ? x.slice(1) : x;
}

module.exports = renderHeading;