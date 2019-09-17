import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  componentDidMount () {
    window.electron.ipcRenderer.on('updateInfo', () => {
      console.log(arguments)
    })
  }

  getUpdate () {
    console.log('0234')
    window.electron.ipcRenderer.send('getUpdate')
  }
  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button onClick={() => this.getUpdate()}>获取更新</button>
          <p id="content">
            This is v1.0.0
          </p>
        </header>
      </div>
    );
  }
}

export default App;
