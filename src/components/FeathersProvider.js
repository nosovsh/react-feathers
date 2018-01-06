import React from 'react';
import PropTypes from 'prop-types';

class FeathersProvider extends React.Component {
  getChildContext() {
    const {
      services,
      dataIdFromObject,
    } = this.props;

    return {
      feathers: {
        services,
        dataIdFromObject,
      },
    };
  }

  render() {
    // TODO: rerender if something changed
    return this.props.children;
  }
}

FeathersProvider.childContextTypes = {
  feathers: PropTypes.object
};

FeathersProvider.propTypes = {
  services: PropTypes.object
};

FeathersProvider.defaultPropTypes = {
  dataIdFromObject: obj => undefined
};

export default FeathersProvider;
