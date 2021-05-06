import React, {Component} from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import logo from './images/iSorterlogo.png';
import smalllogo from './images/smalliSorterlogo.png';
import signInWithApple from './images/sign_in_with_apple_button.png';
import { developerToken } from './configure.js';
import { createGlobalStyle } from "styled-components";
import CheckboxContainer from './CheckBox.js';

// import Montserrat font
const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&display=swap');
  body {
    font-family: 'Montserrat', sans-serif;
  }
`

// sign in with apple button (image is put over it)
const SignInButton = styled.button`
  background: transparent;
  border: transparent;
`;
const Button = styled.button`
  font-family: 'Montserrat', sans-serif;
  background: white;
  border-radius: 3px;
  border: 3px solid #00b1cc;
  background-color: #121640;
  color: #ee3ec9;
  margin-top: 40px;
  margin-bottom: 40px;
  padding: 0.25em 1em;
  font-size: 20px;
  border-radius: 8px;
`;
const SmallText = styled.h1`
  font-size: 20px;
  text-align: center;
  color: #e43397;
`;
const Logo = styled.img`
  width: 460px;
  height: 329px;
  margin-top: 40px;
  margin-bottom: 60px;
`;
const SmallLogo = styled.img`
  width: 400px;
  height: 160px;
  margin-top: 40px;
  margin-bottom: 50px;
`;
const HomeStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #121640;
  ${Button}:hover {
    background-color: #1b215f;
  }
  ....
`;
const HomeStylesLeftAlign = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #ff0080;
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedOption: "Genre",  // keeps track of sorting option selected
      playlistsInfo: null,      // keeps track of json of playlists
      selectedPlaylists: null,  
      music: null,
      userToken: null,
      isAuthorized: false,
      creatingPlaylists: false,
      isDisplaying: false,
      isCompleted: false};

    this.onValueChange = this.onValueChange.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.onCheckboxSubmit = this.onCheckboxSubmit.bind(this);
    this.resort = this.resort.bind(this);
  }

  componentDidMount() {
    
    const music = window.MusicKit.configure({
      developerToken: developerToken,
      app: {
        name: 'iSorter',
        build: '1'
      }
    });
    this.setState({music: music, isAuthorized: music.isAuthorized});
  }

  onValueChange(event) {
    this.setState({
      selectedOption: event.target.value
    });
  }

  formSubmit(event) {
    event.preventDefault();
    this.setState({creatingPlaylists: true});
    if(this.state.selectedOption === "Genre") {
      this.fetchGenreSortedPlaylists();
    }
    else if (this.state.selectedOption === "Artist") {
      this.fetchArtistSortedPlaylists();
    }
    else if (this.state.selectedOption === "Release Year") {
      this.fetchReleaseDateSortedPlaylists();
    }
  }

  resort(event) {
    this.setState({creatingPlaylists: false, isDisplaying: false, isCompleted: false});
  }

  onCheckboxSubmit() {
    this.setState({isCompleted: true});
  }

  fetchGenreSortedPlaylists() {
    const userToken = this.state.userToken;

    fetch('/create_playlist_by_genre', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({userToken})
    }).then(res => res.json()).then(data => {
      // update the playlistsInfo with the genre playlists
      var tempPlaylistsInfo = [];
      Object.keys(data).forEach(function(playlist) {
        var playlistInfo = {};
        playlistInfo.name = playlist
        playlistInfo.length = data[playlist].relationships.tracks.data.length;
        playlistInfo.data = data[playlist];
        tempPlaylistsInfo.push(playlistInfo);
      });
      this.setState({playlistsInfo: tempPlaylistsInfo, isDisplaying: true});
    });
  }
  
  fetchReleaseDateSortedPlaylists() {
    const userToken = this.state.userToken;

    fetch('/create_playlist_by_release_date', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({userToken})
    }).then(res => res.json()).then(data => {
      // update the playlistsInfo with the release date playlists
      var tempPlaylistsInfo = [];
      Object.keys(data).forEach(function(playlist) {
        var playlistInfo = {};
        playlistInfo.name = playlist
        playlistInfo.length = data[playlist].relationships.tracks.data.length;
        playlistInfo.data = data[playlist];
        tempPlaylistsInfo.push(playlistInfo);
      });
      this.setState({playlistsInfo: tempPlaylistsInfo, isDisplaying: true});
    });
  }

  fetchArtistSortedPlaylists() {
    const userToken = this.state.userToken;

    fetch('/create_playlist_by_artist', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({userToken})
    }).then(res => res.json()).then(data => {
      // update the playlistsInfo with the artist playlists
      var tempPlaylistsInfo = [];
      Object.keys(data).forEach(function(playlist) {
        var playlistInfo = {};
        playlistInfo.name = playlist
        playlistInfo.length = data[playlist].relationships.tracks.data.length;
        playlistInfo.data = data[playlist];
        tempPlaylistsInfo.push(playlistInfo);
      });
      this.setState({playlistsInfo: tempPlaylistsInfo, isDisplaying: true});
    });
  }

  renderSorting() {
    return (
      <HomeStyles>
        <SmallLogo src={smalllogo} />
        <p class="loading">Sorting into playlists</p>
      </HomeStyles>
    )
  }

  renderAuthorization() {
    return (
      <HomeStyles>
        <Logo src={logo} />
        <SignInButton>
          <img src={signInWithApple} width="248" height="47" onClick={
          () => this.state.music.authorize().then(
            musicUserToken => {
              this.setState({userToken: musicUserToken});
            })
        }/>
        </SignInButton>
      </HomeStyles>
    )
  }

  renderChecklist() {
    return (
      <div>
        <SmallLogo src={smalllogo} />
        <CheckboxContainer checkboxes={this.state.playlistsInfo} userToken={this.state.userToken} onSubmit={this.onCheckboxSubmit}/>
      </div>
    )
  }

  renderCreate() {
    return (
      <HomeStyles>
        <Logo src={logo} />
          <HomeStylesLeftAlign>
          <Item>
            <RadioButton
              type="radio"
              name="radio"
              value="Genre"
              checked={this.state.selectedOption === "Genre"}
              onChange={this.onValueChange}
            />
            <RadioButtonLabel />
            <SmallText>Sort by Genre</SmallText>
          </Item>
          <Item>
            <RadioButton
              type="radio"
              name="radio"
              value="Artist"
              checked={this.state.selectedOption === "Artist"}
              onChange={this.onValueChange}
            />
            <RadioButtonLabel />
            <SmallText>Sort by Artist</SmallText>
          </Item>
          <Item>
            <RadioButton
              type="radio"
              name="radio"
              value="Release Year"
              checked={this.state.selectedOption === "Release Year"}
              onChange={this.onValueChange}
            />
            <RadioButtonLabel />
            <SmallText>Sort by Release Year</SmallText>
          </Item>
        </HomeStylesLeftAlign>
        <Button onClick={this.formSubmit}>
          <strong>Sort Library</strong>
        </Button>
      </HomeStyles>
    )
  }

  renderCompleted() {
    return (
      <HomeStyles>
        <SmallLogo src={smalllogo} />
        <p>Done!</p>
        <Button onClick={this.resort}>
          <strong>Resort</strong>
        </Button>
      </HomeStyles>
    )
  }

  render() {
    return (
      <HomeStyles>
        <GlobalStyles/>
        {this.state.music && this.state.music.isAuthorized && this.state.creatingPlaylists && !this.state.isDisplaying && (
          this.renderSorting()
        )}
        {this.state.music && !this.state.music.isAuthorized && (
          this.renderAuthorization()
        )}
        {this.state.music && this.state.music.isAuthorized && !this.state.creatingPlaylists && (
          this.renderCreate()
        )}
        {this.state.music && this.state.music.isAuthorized && this.state.creatingPlaylists && this.state.isDisplaying && !this.state.isCompleted && (
          this.renderChecklist()
        )}
        {this.state.isCompleted && (
          this.renderCompleted()
        )}
      </HomeStyles>
    )
  }
};

const Item = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  position: relative;
`;
const RadioButtonLabel = styled.label`
  position: absolute;
  top: 25%;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 1px solid #bebebe;
`;
const RadioButton = styled.input`
  opacity: 0;
  z-index: 1;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  margin-right: 10px;
  &:hover ~ ${RadioButtonLabel} {
    background: #bebebe;
    &::after {
      content: "";
      display: block;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      margin: 6px;
      background: #eeeeee;
    }
  }
  ${(props) =>
    props.checked &&
    ` 
    &:checked + ${RadioButtonLabel} {
      background: #cb88ff;
      border: 1px solid #cb88ff;
      &::after {
        content: "";
        display: block;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        margin: 6px;
        box-shadow: 1px 3px 3px 1px rgba(0, 0, 0, 0.1);
        background: white;
      }
    }
  `}
`;

export default App;