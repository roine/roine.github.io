import {combineReducers} from 'redux';
import {
  ADD_TODO,
  INPUT_NEW_TODO,
  INCOMPLETE_TODO,
  COMPLETE_TODO,
} from '../constant';

let initialState = {
  newTodoText: '',
  todosNextId: 3,
  todos: [
    {text: 'Wash dishes', completed: false, id: 1},
    {text: 'Make the bed', completed: true, id: 2},
  ],
};

const todolist = (state = initialState, action) => {
  switch (action.type) {
    case INPUT_NEW_TODO:
      return {...state, newTodoText: action.payload.text};
    case ADD_TODO:
      if (state.newTodoText) {
        return {
          ...state,
          todos: state.todos.concat(
              {
                completed: false,
                text: state.newTodoText,
                id: state.todosNextId,
              }),
          newTodoText: '',
          todosNextId: state.todosNextId + 1,
        };
      }
      return state;
    case COMPLETE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
            todo.id === action.payload.id ? markComplete(todo) : todo),
      };
    case INCOMPLETE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
            todo.id === action.payload.id ? markIncomplete(todo) : todo),
      };
    default:
      return state;
  }
};

function markComplete(todo) {
  return {...todo, completed: true};
}

function markIncomplete(todo) {
  return {...todo, completed: false};
}

export default todolist;