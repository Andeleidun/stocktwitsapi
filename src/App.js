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
import CircularProgress from '@material-ui/core/CircularProgress';

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
          <Typography variant="body1" className="namearea">
            <span className="name">{this.props.message.user.name}</span> <span className="username">@ {this.props.message.user.username}</span>
          </Typography>
          <Typography variant="body1" className="text">
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
      error: '',
      interval: undefined,
      currentCount: 5,
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.timer = this.timer.bind(this);
  }

  chips = [];
  tweets = [];
  content = [];

  renderChips(symbols) {
    let chips = [];
    for (let symbol of symbols) {
      if (symbol.tweets) {
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
  }

  setTimer() {
    let intervalId = setInterval(this.timer, 60000);
    this.setState({
      interval: intervalId,
      currentCount: 5
    });
  }

  timer() {
    let newCount = this.state.currentCount - 1;
    if (newCount >= 0) {
      this.setState({ currentCount: newCount })
    } else {
      this.submitRequest();
      clearInterval(this.state.interval);
      this.setTimer();
    }
  }

  renderTweets(symbols) {
    let tweets = [];
    let tweetsFound = 0;
    for (let symbol of symbols) {
      if (symbol.tweets) {
        tweetsFound++;
        for (let tweet of symbol.tweets)
        tweets.push(
          <CardTemplate
            classGiven="card"
            message={tweet}
          />
        );
      }
    }
    if (tweetsFound > 0) {
      this.setTimer();
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
    .catch(error => this.setState({ error: error}));
    for (let symbol of symbols) {
      symbol.url = urlBase.concat(symbol.label).concat(urlEnd);
      let finalUrl = proxyUrl.concat(symbol.url);
      await proxiedRequest(finalUrl)
        .then((data) => {
          symbol.tweets = data.messages;
        })
        .catch(error => this.setState({ error: error}));
    }
    if (!this.state.error) {
      this.renderChips(symbols);
      this.renderTweets(symbols);
    }
    this.setState({ loading: false });
    return(symbols);
  }

  async submitRequest() {
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
  }

  handleChange(event) {
    this.setState({input: event.target.value});
  }

  async handleSubmit(event) {
    this.submitRequest();
    event.preventDefault();
  }

  render() {
    if (this.state.loading) {
      this.content = <CircularProgress />;
    } else if (this.state.error) {
      this.content = <p>{this.state.error}</p>
    } else {
      this.content = (
        <section className="content">
          <section className="chips">
            {this.chips}
          </section>
          <section className="tweets">
            {this.tweets}
          </section>
        </section>
      );
    }
    return (
      <div className="App">
        <Header />
        <main className="app-main">
          <section className="search">
            <form>
              <TextField
                className="stock-input"
                id="stock-symbols"
                label="Input stock symbols (separate with a comma)"
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
          {this.content}
        </main>
      </div>
    );
  }
}

export default App;
