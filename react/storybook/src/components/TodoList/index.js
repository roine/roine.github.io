import React from 'react';
import './TodoList.css';
import {connect} from 'react-redux';
import Input from './../Input';
import Button from './../Button';
import Todo from './../Todo';
import {
  inputNewTodo,
  addTodo,
  completeTodo,
  incompleteTodo,
} from '../../actions/index';
import PropTypes from 'prop-types';

const TodoList = (props) => {

  return (
      <div className="App">
        <Input onChange={(e) => props.inputText(e.target.value)}
               value={props.newTodoText}/>
        <Button onClick={props.addTodo}>Add</Button>
        <h2>Incomplete</h2>
        <ul>
          {props.todos.filter(i => !i.completed).map((item, idx) =>
              <li key={idx}>
                <Todo text={item.text} actionMsg="Mark Complete"
                      onClick={props.completeTodo.bind(null, item.id)}/>
              </li>,
          )}</ul>
        <h2>Completed</h2>
        <ul>
          {props.todos.filter(i => i.completed).map((item, idx) =>
              <li key={idx}>
                <Todo text={item.text} actionMsg="Mark Incomplete"
                      onClick={props.incompleteTodo.bind(null, item.id)}/>
              </li>)
          }</ul>
      </div>
  );
};

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  inputText: PropTypes.func,
  addTodo: PropTypes.func,
  completeTodo: PropTypes.func,
  incompleteTodo: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    newTodoText: state.newTodoText,
    todos: state.todos,
    todosNextId: state.todosNextId,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    inputText: (text) => dispatch(inputNewTodo(text)),
    addTodo: () => dispatch(addTodo()),
    completeTodo: (id) => dispatch(completeTodo(id)),
    incompleteTodo: (id) => dispatch(incompleteTodo(id)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
