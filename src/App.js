import React from 'react';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import Badge from '@material-ui/core/Badge';

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

class CardTemplate extends React.Component {
  render() {
    return (
      <Card className={this.props.classGiven}>
        <CardContent>
          <figure className="picture">
            <img src={this.props.message.user.avatar_url} />
          </figure>
          <Typography variant="p" className="namearea">
            <span className="name">{this.props.message.user.name}</span> <span className="username">@ {this.props.message.user.username}</span>
          </Typography>
          <Typography variant="p" className="text">
            {this.props.message.body}
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symbols: [],
      input: '',
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  chips = [];
  tweets = [];

  renderChips(symbols) {
    let chips = [];
    for (let symbol of symbols) {
      chips.push(
        <Badge badgeContent={symbol.tweets.length} className="badge">
          <Chip
            label={symbol.label}
            className="chip" 
          />
        </Badge>
      )
    }
    this.chips = chips;
  }

  renderTweets(symbols) {
    let tweets = [];
    for (let symbol of symbols) {
      for (let tweet of symbol.tweets)
      tweets.push(
        <CardTemplate
          classGiven="card"
          message={tweet}
        />
      );
    }
    this.tweets = tweets;
  }

  async retrieveTweets(symbols) {
    {/* Retrieves images from StockTwits using open cors-anywhere proxy */}
    this.setState({ loading: true });
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const urlBase = 'https://api.stocktwits.com/api/2/streams/symbol/';
    const urlEnd = '.json';
    const proxiedRequest = (url, options = {headers: {}}) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'stock-twits-live-feed',
      },
    })
    .then(res => res.json())
    .catch(error => console.error(error))
    for (let symbol of symbols) {
      symbol.url = urlBase.concat(symbol.label).concat(urlEnd);
      let finalUrl = proxyUrl.concat(symbol.url);
      await proxiedRequest(finalUrl)
        .then((data) => {
          symbol.tweets = data.messages;
        })
        .catch(error => console.error(error));
      console.log(symbol);
    }
    this.renderChips(symbols);
    this.renderTweets(symbols);
    this.setState({ loading: false });
    return(symbols);
  }

  handleChange(event) {
    this.setState({input: event.target.value});
  }

  async handleSubmit(event) {
    const newSymbols = this.state.input.toUpperCase().replace(/\s+/g, '').split(",");
    let formattedSymbols = [];
    let key = 0;
    for (let symbol of newSymbols) {
      formattedSymbols.push(
        {key: key, label: symbol, tweets: 0}
      );
      key++;
    }
    formattedSymbols = await this.retrieveTweets(formattedSymbols);
    this.setState({symbols: formattedSymbols});
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <Header />
        <main className="app-main">
          <section className="search">
            <form>
              <TextField
                className="stock-input"
                id="stock-symbols"
                label="Input stock symbols"
                value={this.state.input}
                onChange={this.handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />
              <br />
              <Button className="search-button" variant="contained" onClick={this.handleSubmit}>Search</Button>
            </form>
          </section>
          <section className="chips">
            {this.chips}
          </section>
          <section className="tweets">
            {this.tweets}
          </section>
        </main>
      </div>
    );
  }
}

export default App;
