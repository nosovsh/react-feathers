import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { getRequestKey, getEntityKey } from '../utils';

export default (hocParams) => (Component) => {
  class FeathersConnect extends React.Component {
    dispatchServiceActions = () => {
      const { service, method, params, dispatch, id } = this.props;
      const { feathers: { services, dataIdFromObject } } = this.context;
      let methodParams;

      if (typeof params === 'function') {
        methodParams = params(this.props) || {};
      } else {
        methodParams = params;
      }

      let realId;
      if (typeof id === 'function') {
        realId = id(this.props);
      } else {
        realId = id;
      }

      const requestKey = getRequestKey(service, method, realId, methodParams)
      dispatch({
        type: 'LOAD',
        requestKey,
      })
      let request = services[service];
      if (method === 'find') {
        request = request
          .find({ ...methodParams }) // feathers is mutating `params`, we don't want it
          .then((result) => {
            // updatedResult = {$$id: entityKey}
            const entitiesWithKeys = result.data.map(entity => {
              const entityKey = getEntityKey(service, dataIdFromObject(entity));
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
                $$id: getEntityKey(service, dataIdFromObject(entity))
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
          .get(realId, { ...params }) // feathers is mutating `params`, we don't want it
          .then(result => {
            const entityKey = getEntityKey(service, dataIdFromObject(result));
            dispatch({
              type: 'SET_ENTITY',
              entityKey,
              entity: result,
            });
            const updatedResult = { $$id: entityKey }
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
      const { name = 'data' } = this.props;
      const dataWithDispatch = {
        ...this.props[name],
        refetch: () => {
          this.dispatchServiceActions();
        }
      };
      const newProps = omit(
        this.props,
        [
          'id',
          'params',
          // TODO: add other fields also
        ]
      );
      newProps[name] = dataWithDispatch;
      return (
        <Component
          {...newProps}
        />
      );
    }
  }

  FeathersConnect.contextTypes = {
    feathers: PropTypes.object
  };


  const mapStateToProps = (state, props) => {
    const { service, id, method, params = {}, name = 'data' } = hocParams;
    let methodParams;

    if (typeof params === 'function') {
      methodParams = params(props) || {};
    } else {
      methodParams = params;
    }

    let realId;
    if (typeof id === 'function') {
      realId = id(props);
    } else {
      realId = id;
    }

    const requestKey = getRequestKey(service, method, realId, methodParams)
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
      [name]: convertedData,
    }
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatch,
  });

  return connect(mapStateToProps, mapDispatchToProps)(FeathersConnect);
};
