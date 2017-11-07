import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import {getRequestKey} from '../utils';

export default (hocParams = {}) => (Component) => {
  class FeathersConnect extends React.Component {
    dispatchServiceActions = () => {
      const {service, method, params, dispatch, id} = this.props;
      const {feathers: {services}} = this.context;
      let methodParams;

      if (typeof params === 'function') {
        methodParams = params(this.props) || {};
      } else {
        methodParams = params;
      }

      const requestKey = getRequestKey(service, method, id, methodParams)
      console.log('withQueryFeathers request', requestKey, this.props)
      dispatch({
        type: 'LOAD',
        requestKey,
      })
      let request = services[service];
      if (method === 'find') {
        request = request.find({...params}) // feathers is mutating `params`, we don't want it
      } else if (method === 'get') {
        request = request.get(id, {...params}) // feathers is mutating `params`, we don't want it
      }
      request
        .then((result) => {
          dispatch({
            type: 'LOAD_SUCCESS',
            requestKey,
            result
          })
        })
      // .catch() // TODO

    }

    componentDidMount = () => {
      this.dispatchServiceActions();
    }

    render() {
      return (
        <Component {...this.props} />
      );
    }
  }

  FeathersConnect.contextTypes = {
    feathers: PropTypes.object
  };


  const mapStateToProps = (state, props) => {
    const {service, id, method, params = {}} = hocParams;
    let methodParams;

    if (typeof params === 'function') {
      methodParams = params(props) || {};
    } else {
      methodParams = params;
    }

    const requestKey = getRequestKey(service, method, id, methodParams)
    const data = get(state, `feathers.queries.${requestKey}`, {});

    return {
      ...hocParams,
      data,
    }
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatch,
  });

  return connect(mapStateToProps, mapDispatchToProps)(FeathersConnect);
};
