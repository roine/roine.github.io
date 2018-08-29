import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import {
  addTimeTravelingToState,
  createReducerWithEvent
}  from './helper';

class App extends Component {
  constructor(props) {
    super(props);
    const initialModel = {text: "Hello World", counter: 0}
    this.state = addTimeTravelingToState({
      model: initialModel
    });

    this.travelTime = this.travelTime.bind(this);
    this.doChangeText = this.doChangeText.bind(this);
    this.createReducerWithEvent = createReducerWithEvent.bind(this);

    this.changeText = this.createReducerWithEvent(this.doChangeText);
    this.clickButton = this.createReducerWithEvent(this.doClickButton);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <input type="text" onChange={this.changeText} value={this.state.model.text}/>
        </p>
        <div>
          <button onClick={this.clickButton}>Increment</button>
          {this.state.model.counter}
        </div>
        <div>
          <input type="range" min="1" onChange={this.travelTime} max={this.state._history.length}
                 value={this.state._currentHistory}/>
          {this.state._currentHistory}/{this.state._history.length}
        </div>
      </div>
    );
  }

  // no side effect here
  doChangeText(prevModel, e) {
    const newText = e.target.value;
    return Object.assign({}, prevModel, {text: newText});
  }

  doClickButton(prevModel, e) {
    return Object.assign({}, prevModel, {counter: prevModel.counter + 1});
  }


  travelTime(e) {
    e.persist();
    const model = this.state._history[e.target.value - 1];
    this.setState(prevState => ({
      model: model,
      _currentHistory: e.target.value,
      _traveling: parseInt(e.target.value, 10) !== this.state._history.length
    }))
  }
}

export default App;
