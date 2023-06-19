import { SET_AUTHENTICATED_USER, CLEAR_AUTHENTICATED_USER } from '../types';
export default (state, action) => {
  switch (action.type) {
    case SET_AUTHENTICATED_USER:
      return {...state, authenticatedUser: action.payload};
    case CLEAR_AUTHENTICATED_USER:
      return {...state, authenticatedUser: {}};
    default:
      return state;
  }
};
