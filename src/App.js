import React from 'react';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

class Header extends React.Component {
  render() {
    return (
      <header className="app-header">
        <AppBar position="static">
          <Toolbar className="title-bar">
            <Typography variant="h1">
              StockTwits Live Feed
            </Typography>
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

function App() {
  return (
    <div className="App">
      <Header />
      <main className="app-main">
        
      </main>
    </div>
  );
}

export default App;
