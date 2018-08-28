import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    const initialModel = {text: "Hello World"}
    this.state = {
      model: initialModel,
      history: [initialModel],
      currentHistory: 1,
      traveling: false
    };

    this.changeText = this.changeText.bind(this);
    this.travelTime = this.travelTime.bind(this);
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
          <input type="range" min="1" onChange={this.travelTime} max={this.state.history.length}
                 value={this.state.currentHistory}/>
          {this.state.currentHistory}/{this.state.history.length}
        </p>
      </div>
    );
  }

  travelTime(e) {
    e.persist();
    const model = this.state.history[e.target.value - 1]
    this.setState(prevState => ({
      model: model,
      currentHistory: e.target.value,
      traveling: parseInt(e.target.value, 10) !== this.state.history.length
    }))
  }

  changeText(e) {
    if (this.state.traveling) return;
    e.persist();
    this.setState(this.doChangeText.bind(null, e.target.value))
    e.preventDefault();
  }

  @injectHistory
  doChangeText(newText, prevState) {
    const newModel = {
      ...prevState.model,
      text: newText

    };
    const newHistory = [...prevState.history, newModel];

    return {
      model: newModel,
      history: newHistory,
      currentHistory: prevState.currentHistory + 1
    }
  }
}

function injectHistory(target, name, descriptor) {
  console.log()
  return descriptor;
}

export default App;
