import React from 'react';
import PropTypes from 'prop-types';

class FeathersProvider extends React.Component {
  getChildContext() {
    const {services} = this.props;

    return {
      feathers: {
        services
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

export default FeathersProvider;
