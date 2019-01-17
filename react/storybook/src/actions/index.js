import {
  ADD_TODO,
  INPUT_NEW_TODO,
  COMPLETE_TODO,
  INCOMPLETE_TODO,
} from '../constant';

export const inputNewTodo = newText => {
  return {
    type: INPUT_NEW_TODO,
    payload: {
      text: newText,
    },
  };
};

export const addTodo = () => {
  return {
    type: ADD_TODO,
  };
};

export const completeTodo = (id) => {
  return {
    type: COMPLETE_TODO,
    payload: {
      id,
    },
  };
};

export const incompleteTodo = (id) => {
  return {
    type: INCOMPLETE_TODO,
    payload: {
      id,
    },
  };
};