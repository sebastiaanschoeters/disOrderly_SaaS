import logo from './logo.svg';
import './App.css';
import React from 'react';
import { DatePicker } from 'antd';


function App() {
  return (

    <div className="App">
      <DatePicker />
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <h1>
                Hello world!
            </h1>
        </header>
    </div>
  );
}

export default App;
