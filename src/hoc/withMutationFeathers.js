import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

export default (hocParams = {}) => (Component) => {
  class FeathersConnect extends React.Component {
    render() {
      const {feathers: {services}} = this.context;
      const { method, service} = this.props;

      const fn = (...args) => {
        console.log(`Executing ${service}.${method} mutation with parameters:`, ...args)
        return services[service][method](...args)
          .then(result => {
            console.log(`Successful ${service}.${method} mutation with result:`, result)
            return result;
          })
          .catch(err => {
            console.log(`Unsuccessful ${service}.${method} mutation with result:`, err)
            throw err;
          })
      }

      return (
        <Component
          {...{
            ...this.props,
            [method]: fn
          }}
        />
      );
    }
  }

  FeathersConnect.contextTypes = {
    feathers: PropTypes.object
  };


  const mapStateToProps = (state, props) => {
    return {
      ...hocParams
    }
  };

  const mapDispatchToProps = (dispatch, {service, method}) => {
    return {
    }
  }


  return connect(mapStateToProps, mapDispatchToProps)(FeathersConnect);
};
