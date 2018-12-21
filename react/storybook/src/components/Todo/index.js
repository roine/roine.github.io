import React from 'react';
import Button from '../Button/index';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'


function Index({text, onClick, actionMsg}) {
  return <React.Fragment>
    <span>{text}</span>
    <Button onClick={onClick}>{actionMsg}</Button>
  </React.Fragment>;
}

Index.propTypes = {
  item: PropTypes.shape({
    text: PropTypes.string,
    completed: PropTypes.bool,
    id: PropTypes.number
  }),
  actionText: PropTypes.string,
  action: PropTypes.func
};


export default connect()(Index);

