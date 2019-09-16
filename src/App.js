import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button>获取更新</button>
          <p id="content">
            This is v1.0.0
          </p>
        </header>
      </div>
    );
  }
}

export default App;
