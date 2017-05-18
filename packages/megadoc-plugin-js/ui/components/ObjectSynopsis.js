const React = require('react');
const { PropTypes, } = React;
const PropertyTag = require('./Tags/PropertyTag');

const ObjectSynopsis = React.createClass({

  propTypes: {
    doc: PropTypes.object,
    anchor: PropTypes.string,
  },

  render() {
    const { anchor, doc } = this.props;
    const tags = this.props.doc.tags.filter(tag => tag.type === 'property');

    const tree = tags
      .reduce((map, tag) => {
        const fragments = tag.typeInfo.name.split('.');
        const parentKey = fragments.slice(0, -1).join('.');

        if (!map[parentKey]) {
          map[parentKey] = [];
        }

        map[parentKey].push(tag)

        return map;
      }, {})
    ;

    const render = key => {
      const childTags = tree[key];

      if (!childTags || !childTags.length) {
        return null;
      }

      return (
        childTags.map((tag, index) => {
          const children = render(tag.typeInfo.name)
          const isRoot = tag.typeInfo.name === doc.name;

          return (
            <div key={`${key}__${index}`}>
              <PropertyTag
                anchor={isRoot && anchor || null}
                collapsible={isRoot}
                typeInfo={Object.assign({}, tag.typeInfo, {
                  name: tag.typeInfo.name.split('.').slice(-1).join('.')
                })}
              >
                {children}
              </PropertyTag>
            </div>
          )
        })
      )
    }

    return (
      <div className="js-object-synopsis">
        {render('')}
      </div>
    );
  }
});

module.exports = ObjectSynopsis;
