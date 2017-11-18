import {LOAD, LOAD_FAILURE, LOAD_SUCCESS, SET_ENTITY, SET_ENTITIES} from '../constants';
import {combineReducers} from 'redux';

const query = (state = {
  loading: false,
  loaded: false,
  result: null,
  error: null,
}, action) => {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        result: action.result,
      }
    case LOAD_FAILURE:
      return {
        ...state,
        loading: false,
        response: null,
        error: {
          httpCode: action.httpCode
        }
      };

    default:
      return state;
  }
}

const queries = (state = {}, action) => {
  switch (action.type) {
    case LOAD:
    case LOAD_SUCCESS:
    case LOAD_FAILURE:
      return {
        ...state,
        [action.requestKey]: query(state[action.requestKey], action),
      };

    default:
      return state;
  }
}

const entity = (state = {
  data: {}
}, action) => {
  switch (action.type) {
    case SET_ENTITY:
      return {
        ...state,
        data: action.entity // TODO: deep merge?
      }
  }
}

const entities = (state = {}, action) => {
  switch (action.type) {
    case SET_ENTITY:
      return {
        ...state,
        [action.entityKey]: entity(state[action.entityKey], action),
      };

    case SET_ENTITIES:
      const updatedEntities = {};
      action.entitiesWithKeys.map(entitityWithKey => {
        updatedEntities[entitityWithKey.entityKey] = entity(state[entitityWithKey.entityKey], {
          type: SET_ENTITY,
          entity: entitityWithKey.entity
        })
      })
      return {
        ...state,
        ...updatedEntities,
      };

    default:
      return state;
  }
}

export default combineReducers({
  queries,
  entities,
});
