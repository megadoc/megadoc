const React = require('react');
const ErrorMessage = require('components/ErrorMessage');
const { Outlet, OutletRenderer } = require('react-transclusion');
const { PropTypes } = React;

const WidgetOutlet = React.createClass({
  propTypes: {
    $outletOptions: PropTypes.shape({
      name: PropTypes.string,
      tagName: PropTypes.tagName,
      outlets: PropTypes.array,
      className: PropTypes.string,
    }).isRequired,
  },

  render() {
    const { $outletOptions } = this.props;
    const HTMLTag = $outletOptions.tagName || 'div';

    return (
      <HTMLTag
        className={$outletOptions.className}
        children={this.renderOutlets($outletOptions)}
      />
    );
  },

  renderOutlets({ outlets, name }) {
    return outlets.map((outlet,i) => {
      const key = `${outlet.name}__${i}`;

      if (!this.props.isOutletDefined(outlet.name)) {
        return (
          <ErrorMessage key={key}>
            <p>
              Outlet "{outlet.name}" used in widget "{name}" has not been defined! This is most likely
              a configuration error. Please verify the outlet name is correct.
            </p>
          </ErrorMessage>
        );
      }
      // else if (!outlet.scope) {
      //   return (
      //     <ErrorMessage key={key}>
      //       <div>
      //         <p>
      //           No document was found with the UID "{outlet.using}" to be inserted
      //           into the outlet "{outlet.name}" of the widget "{name || '<<unknown>>'}".
      //         </p>
      //         <p>
      //           This is most likely a configuration error.
      //         </p>
      //       </div>
      //     </ErrorMessage>
      //   );
      // }

      return (
        <Outlet
          key={key}
          name={outlet.name}
          options={outlet.options}
          elementProps={outlet.scope || null}
        />
      );
    }).filter(x => !!x)
  }
});

module.exports = OutletRenderer(WidgetOutlet);
