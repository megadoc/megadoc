const React = require('react');
const HighlightedText = require('components/HighlightedText');
const ModuleHeader = require('../components/ModuleHeader');
const FunctionSignature = require('../components/FunctionSignature');
const FunctionParams = require('../components/FunctionParams');
const FunctionReturns = require('../components/FunctionReturns');
const ExampleTags = require('../components/ExampleTags');
const { string, array, } = React.PropTypes;

const AllModules = React.createClass({
  propTypes: {
    routeName: string,
    database: array,
  },

  render() {
    const { database } = this.props;

    const modules = database.filter(function(doc) {
      return doc.isModule;
    });

    return (
      <div className="lua">
        {modules.map(this.renderModule)}
      </div>
    )
  },

  renderModule(moduleDoc) {
    const { database } = this.props;

    const entities = database.filter(function(doc) {
      return doc.receiver === moduleDoc.id;
    });

    const functions = entities.filter(e => e.ctx.type === 'function');
    const description = moduleDoc.tags.reduce(function(fragments, tag) {
      if (~[ 'module' ].indexOf(tag.type)) {
        fragments.push(tag.description);
      }

      return fragments;
    }, [ moduleDoc.description ]).join('\n');

    return (
      <div key={moduleDoc.path}>
        <ModuleHeader
          doc={moduleDoc}
          anchorId={
            undefined
            /*
            TODO: port to corpus
            Router.generateAnchorId({
              routeName: `${this.props.routeName}.module`,
              params: {
                moduleId: moduleDoc.id
              }
            })
            */
          }
        />

        <HighlightedText>
          {description}
        </HighlightedText>

        <div>
          {functions.map(this.renderFunction)}
        </div>
      </div>
    );
  },

  renderFunction(doc) {
    return (
      <div key={doc.path} className="lua-function">
        <ModuleHeader
          level="2"
          doc={doc}
          anchorId={
            undefined
            /* TODO: port to corpus
            Router.generateAnchorId({
              routeName: `${this.props.routeName}.module.entity`,
              params: {
                moduleId: doc.receiver,
                entityId: doc.symbol + doc.id
              }
            })
            */
          }
        />

        <HighlightedText>{doc.description}</HighlightedText>

        <FunctionSignature doc={doc} />
        <FunctionParams doc={doc} />
        <FunctionReturns doc={doc} />
        <ExampleTags doc={doc} />
      </div>
    );
  }
});

module.exports = AllModules;
