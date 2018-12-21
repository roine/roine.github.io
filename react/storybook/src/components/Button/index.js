import React from 'react';

export default function Button(props) {
  const style =  (({backgroundColor, color}) => ({backgroundColor, color}))(props);
  return (<button {...props} style={style}>{props.children}</button>)
}