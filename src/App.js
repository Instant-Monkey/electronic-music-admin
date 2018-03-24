import React, { Component } from 'react';


import SearchWrapper from './components/SearchWrapper';
import './App.css';
class App extends Component {
  render() {
    return (
        <div className="App">
          <h1>Admin</h1>
          <SearchWrapper />
        </div>
    );
  }
}

export default App;
