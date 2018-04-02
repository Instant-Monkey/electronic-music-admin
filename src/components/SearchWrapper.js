import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchContainer from './SearchContainer';
import ResultsContainer from './ResultsContainer';
import apiKey from '../apiAuthentificate';

const style = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
};
export default class SearchWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumsResults: [],
      spotifyChecked: false,
      noResult: false,
      searchIdChecked: false,
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.renderAlbumResults = this.renderAlbumResults.bind(this);
    this.updateSpotifyChecked = this.updateSpotifyChecked.bind(this);
    this.updateSearchIdChecked = this.updateSearchIdChecked.bind(this);
  }
  handleSearch = (query) => {
    if (query.length > 0) {
      if (this.state.searchIdChecked) {
        this.setState({ noResult: false }, () => {
          fetch(`${process.env.REACT_APP_API_URL}/albums/get-spotify/${query}`, {
            method: 'GET',
            headers: new Headers(apiKey()),
          })
            .then(res => res.json())
            .then((album) => {
              if (album.id === query) {
                return this.setState({ albumsResults: [album] });
              }
              return this.setState({
                noResult: true,
                albumsResults: [],
              });
            });
        });
      } else {
        this.setState({ noResult: false }, () => {
          fetch(`${process.env.REACT_APP_API_URL}/albums/search-spotify/${query}`, {
            method: 'GET',
            headers: new Headers(apiKey()),
          })
            .then(res => res.json())
            .then((found) => {
              if (found.items.length > 0) {
                return this.setState({ albumsResults: found.items });
              }
              return this.setState({
                noResult: true,
                albumsResults: [],
              });
            });
        });
      }
    }
  }
  updateSpotifyChecked() {
    this.setState({
      spotifyChecked: !this.state.spotifyChecked,
    });
  }
  updateSearchIdChecked() {
    this.setState({
      searchIdChecked: !this.state.searchIdChecked,
    });
  }
  renderAlbumResults = () => {
    if (this.state.albumsResults.length > 0) {
      return (
        <ResultsContainer
          title="Albums Results"
          type="album"
          results={this.state.albumsResults}
          spotifyChecked={this.state.spotifyChecked}
          isUnderManagement={this.props.isUnderManagement}
          addRelationship={this.props.addRelationship}

        />);
    }
    if (this.state.noResult) {
      return <h1> Pas de résultats </h1>;
    }
    return null;
  }
  render() {
    return (
      <div>
        <SearchContainer
          handleSearch={this.handleSearch}
          spotifyChecked={this.state.spotifyChecked}
          updateSpotifyChecked={this.updateSpotifyChecked}
          searchIdChecked={this.state.searchIdChecked}
          updateSearchIdChecked={this.updateSearchIdChecked}
        />
        <div style={style}>
          {this.renderAlbumResults()}
        </div>
      </div>
    );
  }
}

SearchWrapper.defaultProps = {
  isUnderManagement: false,
  addRelationship: () => null,
};

SearchWrapper.propTypes = {
  isUnderManagement: PropTypes.bool,
  addRelationship: PropTypes.func,
};
