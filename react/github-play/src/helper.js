export const addTimeTravelingToState = (state) => {
  return Object.assign({}, state, {
    _history: [state],
    _currentHistory: 1,
    _traveling: false
  })
};

export const createReducerWithEvent = function (fn) {
  return (e) => {
    e.persist();
    if (this.state._traveling) return;
    this.setState((prevState) => {
      // make sure we dont change the time travel state
      const {_history, _currentHistory, _traveling, ...newModel} = fn(prevState.model, e);
      const newHistory = [...prevState._history, newModel];
      return {
        model: newModel,
        _history: newHistory,
        _currentHistory: parseInt(prevState._currentHistory) + 1
      }
    })
  }
};