import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import {getRequestKey, getEntityKey} from '../utils';

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
      dispatch({
        type: 'LOAD',
        requestKey,
      })
      let request = services[service];
      if (method === 'find') {
        request = request
          .find({...params}) // feathers is mutating `params`, we don't want it
          .then((result) => {
            // updatedResult = {$$id: entityKey}
            const entitiesWithKeys = result.data.map(entity => {
              const entityKey = getEntityKey(service, entity._id);
              return {
                entityKey,
                entity,
              }
            })

            dispatch({
              type: 'SET_ENTITIES',
              entitiesWithKeys,
            });

            const convertedResult = {
              ...result,
              data: result.data.map(entity => ({
                $$id: getEntityKey(service, entity._id)
              }))
            }

            dispatch({
              type: 'LOAD_SUCCESS',
              requestKey,
              result: convertedResult,
            })

            return convertedResult
          })
      } else if (method === 'get') {
        request = request
          .get(id, {...params}) // feathers is mutating `params`, we don't want it
          .then(result => {
            const entityKey = getEntityKey(service, result._id);
            dispatch({
              type: 'SET_ENTITY',
              entityKey,
              entity: result,
            });
            const updatedResult = {$$id: entityKey}
            dispatch({
              type: 'LOAD_SUCCESS',
              requestKey,
              result: updatedResult,
            })
            return result;
          })
      }
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

    let convertedData = data;
    if (data.result) {
      if (method === 'find') {
        const entities = data.result.data.map(entityOrLink => {
          if (entityOrLink.$$id) {
            const entity = get(state, `feathers.entities.${entityOrLink.$$id}.data`);
            if (entity) {
              return entity
            } else {
              throw `No such entity in storage: ${entityOrLink.$$id}`
            }
          } else {
            return entityOrLink;
          }
        })
        convertedData = {
          ...data,
          result: {
            ...data.result,
            data: entities,
          }
        }
      } else if (method === 'get') {
        const entityKey = get(data, 'result.$$id');
        if (entityKey) {
          const entity = get(state, `feathers.entities.${entityKey}.data`);
          if (entity) {
            convertedData = {
              ...convertedData,
              result: entity
            }
          } else {
            throw `No such entity in storage: ${entityKey}`
          }
        }
      }
    }
    return {
      ...hocParams,
      data: convertedData,
    }
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatch,
  });

  return connect(mapStateToProps, mapDispatchToProps)(FeathersConnect);
};
