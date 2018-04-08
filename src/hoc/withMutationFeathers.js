import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getRequestKey, getEntityKey} from '../utils';

export default (hocParams = {}) => (Component) => {
  class FeathersConnect extends React.Component {
    render() {
      const {feathers: {services, dataIdFromObject}} = this.context;
      const {method, service, dispatch, name} = this.props;
      const fn = (...args) => {
        console.log(`Executing ${service}.${method} mutation with parameters:`, ...args)
        return services[service][method](...args)
          .then(result => {
            console.log(`Successful ${service}.${method} mutation with result:`, result)
            return result;
          })
          .then(result => {

            const entityKey = getEntityKey(service, dataIdFromObject(result))
            dispatch({
              type: 'SET_ENTITY',
              entityKey,
              entity: result,
            });

            // TODO: return result only when dispatch finished
            return result
          })
          .catch(err => { // TODO: wrong place for catch
            console.log(`Unsuccessful ${service}.${method} mutation with result:`, err)
            throw err;
          })
      }

      return (
        <Component
          {...{
            ...this.props,
            [name || method]: fn
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

  const mapDispatchToProps = (dispatch) => ({
    dispatch,
  });

  return connect(mapStateToProps, mapDispatchToProps)(FeathersConnect);
};
