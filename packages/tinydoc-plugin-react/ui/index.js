const React = require('react');
const Router = require('core/Router');
const Editor = require('./Editor');
const LiveExampleTag = require('./LiveExampleTag');
const OutletManager = require('core/OutletManager');
const Link = require('components/Link');
const { object, shape, string, bool } = React.PropTypes;

tinydoc.use(function ReactPlugin(/*api*/) {
  tinydoc.getRuntimeConfigs('react').forEach(function(config) {
    const { routeName } = config;

    OutletManager.add('CJS::ExampleTag', {
      key: `${routeName}__jsx-example-tag`,

      match: function(props) {
        return (
          props.tag.typeInfo.types[0] === 'jsx' &&
          props.routeName === routeName
        );
      },

      component: React.createClass({
        propTypes: {
          tag: object,
        },

        render() {
          return <LiveExampleTag tag={this.props.tag} config={config} />;
        }
      })
    });

    OutletManager.add('CJS::ModuleHeader::Type', {
      key: `${routeName}__react-component-type`,

      match: function(props) {
        return (
          props.doc.ctx.type === 'component' &&
          props.routeName === routeName
        );
      },

      component: React.createClass({
        propTypes: {
          doc: shape({
            id: string,
          }),
        },

        render() {
          return (
            <span>
              <span>Component</span>

              {' '}

              <Link
                to={`${routeName}.module`}
                params={{ moduleId: this.props.doc.id }}
                query={{
                  editing: '1',
                  source: routeName
                }}
                children="Try it!"
              />
            </span>
          );
        }
      })
    });

    OutletManager.add('CJS::ModuleBody', {
      key: `${routeName}__jsx-editor`,


      match(props) {
        return (
          props.moduleDoc.ctx.type === 'component' &&
          props.routeName === routeName
        );
      },

      component: React.createClass({
        propTypes: {
          params: shape({
            moduleId: string,
          }),

          moduleDoc: shape({
            id: string,
          }),

          query: shape({
            source: string,
            editing: bool,
          })
        },

        render() {
          if (
            this.props.query.editing &&
            this.props.query.source === routeName &&
            this.props.params.moduleId === this.props.moduleDoc.id
          ) {
            return (
              <Editor config={config} onClose={this.close} {...this.props} />
            );
          }
          else {
            return null;
          }
        },

        close() {
          Router.updateQuery({
            editing: null,
            source: null
          });
        }
      })
    });
  });
});
