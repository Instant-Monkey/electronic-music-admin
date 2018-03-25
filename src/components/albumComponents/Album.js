import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Card, CardActions, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';

import AlbumActions from './AlbumActions';
import apiKey from '../../apiAuthentificate';

export default class Album extends Component {
  constructor(props) {
    super(props);
    this.state = {
      album: {},
      existInDatabase: false,
      loading: true,
      style: {
        width: `calc(${this.props.width} - 20px)`,
        flex: '0 0 auto',
        margin: '10px',
      },
    };
    this.addAlbumToNeo4J = this.addAlbumToNeo4J.bind(this);
    this.addArtistToNeo4J = this.addArtistToNeo4J.bind(this);
    this.addArtistAlbumRelationship = this.addArtistAlbumRelationship.bind(this);
    this.updateItself = this.updateItself.bind(this);
  }
  componentDidMount() {
    this.updateItself(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.updateItself(nextProps);
  }
  updateItself(props) {
    // every album has to search for itself in spotify to be displayed
    fetch(`${process.env.REACT_APP_API_URL}/albums/get-spotify/${props.id}`, {
      method: 'GET',
      headers: new Headers(apiKey()),
    })
      .then(res => res.json())
      .then(album => this.setState({
        album,
        loading: false,
      }));
    // if the album is displayed in the context of search, it searchs for itself in the databse
    if (props.hasBeenSearched) {
      return fetch(`${process.env.REACT_APP_API_URL}/albums/${props.id}`, {
        method: 'GET',
        headers: new Headers(apiKey()),
      })
        .then(res => res.json())
        .then(dbAlbumInfo => this.setState({
          existInDatabase: !_.isEmpty(dbAlbumInfo),
        }));
    }
    return null;
  }
  addArtistAlbumRelationship() {
    const property = {
      source: {
        label: 'Artist',
        _id: this.state.album.artists[0].id,
      },
      target: {
        label: 'Album',
        _id: this.state.album.id,
      },
      rel: {
        reltype: 'AUTHORED',
      },
    };
    fetch(`${process.env.REACT_APP_API_URL}/add-relationship`, {
      method: 'POST',
      headers: new Headers(apiKey()),
      body: JSON.stringify(property),
    }).then(res => res.json())
      .then(addedRelation => console.log(addedRelation));
  }
  addAlbumToNeo4J() {
    fetch(`${process.env.REACT_APP_API_URL}/albums/add-album`, {
      method: 'POST',
      headers: new Headers(apiKey()),
      body: JSON.stringify(this.state.album),
    }).then(res => res.json())
      .then((insertedAlbum) => {
        console.log('added :', insertedAlbum);
        this.setState({
          existInDatabase: !_.isEmpty(insertedAlbum),
        });
        // we check if the artist exist in the database
        fetch(`${process.env.REACT_APP_API_URL}/artists/${this.state.album.artists[0].id}`, {
          method: 'GET',
          headers: new Headers(apiKey()),
        })
          .then(res => res.json())
          .then((artistRes) => {
            if (_.isEmpty(artistRes)) {
              // if not, we add him to the db
              this.addArtistToNeo4J(() => this.addArtistAlbumRelationship());
            } else {
              // if it exist we create the relationship
              this.addArtistAlbumRelationship();
            }
          });
      });
  }

  addArtistToNeo4J(callback) {
    fetch(`${process.env.REACT_APP_API_URL}/artists/get-spotify/${this.state.album.artists[0].id}`, {
      method: 'GET',
      headers: new Headers(apiKey()),
    })
      .then(res => res.json())
      .then((spotifyArtist) => {
        fetch(`${process.env.REACT_APP_API_URL}/artists/add-artist`, {
          method: 'POST',
          headers: new Headers(apiKey()),
          body: JSON.stringify(spotifyArtist),
        }).then(res => res.json())
          .then((insertedArtist) => {
            console.log(' Artist added :', insertedArtist);
            if (_.isFunction(callback)) {
              callback();
            }
          });
      });
  }
  render() {
    if (!this.state.loading) {
      // if the spotify checkbox is checked,
      // we only display the component if it has been found in the database
      if (!this.props.spotifyChecked || this.state.existInDatabase) {
        return (
          <Card style={this.state.style}>
            <CardMedia
              overlay={
                <CardText>{this.props.overlayTitle}</CardText>
              }
            >
              <img src={this.state.album.images[0].url} alt="" />
            </CardMedia>
            <CardTitle title={this.state.album.name} subtitle={this.state.album.artists[0].name} />
            <CardActions>
              <AlbumActions
                hasBeenSearched={this.props.hasBeenSearched}
                isUnderManagement={this.props.isUnderManagement}
                existInDatabase={this.state.existInDatabase}
                id={this.props.id}
                addRelationship={this.props.addRelationship}
                addAlbumToNeo4J={this.addAlbumToNeo4J}
              />
            </CardActions>
          </Card>
        );
      }
      return null;
    }
    return (
      <Card style={this.state.style}>
        <CircularProgress />
      </Card>
    );
  }
}

Album.defaultProps = {
  hasBeenSearched: false,
  isUnderManagement: false,
  spotifyChecked: false,
  width: '25%',
  overlayTitle: '',
  addRelationship: () => null,
};

Album.propTypes = {
  id: PropTypes.string.isRequired,
  hasBeenSearched: PropTypes.bool,
  isUnderManagement: PropTypes.bool,
  spotifyChecked: PropTypes.bool,
  width: PropTypes.string,
  addRelationship: PropTypes.func,
  overlayTitle: PropTypes.string,
};
