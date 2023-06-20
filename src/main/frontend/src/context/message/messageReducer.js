import { SHOW_MESSAGE, HIDE_MESSAGE } from '../types';
export default (state, action) => {
  switch (action.type) {
    case SHOW_MESSAGE:
      return {...state, currentMessage: action.payload};
    case HIDE_MESSAGE:
      return {...state, currentMessage: {}};
    default:
      return state;
  }
};
