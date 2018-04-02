import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Card, CardActions, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import AlbumActions from './AlbumActions';
import apiKey from '../../apiAuthentificate';

export default class Album extends Component {
  constructor(props) {
    super(props);
    this.state = {
      album: {},
      existInDatabase: false,
      loading: true,
      messRelationDialogOpen: false,
      messaRelation: props.overlayTitle,
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
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleMessDialogOpen = this.handleMessDialogOpen.bind(this);
    this.handleMessDialogClose = this.handleMessDialogClose.bind(this);
    this.renderOverlay = this.renderOverlay.bind(this);
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
  handleTextChange = (event) => {
    this.setState({
      messaRelation: event.target.value,
    });
  };
  handleMessDialogOpen = () => {
    this.setState({ messRelationDialogOpen: true });
  };

  handleMessDialogClose = () => {
    this.setState({ messRelationDialogOpen: false });
  };

  renderOverlay() {
    if (this.props.overlayTitle.length > 0) {
      const actions = [
        <FlatButton
          label="Cancel"
          primary
          onClick={this.handleMessDialogClose}
        />,
        <FlatButton
          label="Submit"
          primary
          keyboardFocused
          onClick={() => {
            this.props.editRelationshipMessage(this.props.id, this.state.messaRelation);
            return this.handleMessDialogClose();
          }}
        />,
      ];
      return (
        <div>
          <CardText style={{ color: '#fff', cursor: 'pointer' }} onClick={this.handleMessDialogOpen}>
            {this.props.overlayTitle}
          </CardText>
          <Dialog
            title="Editez le message de la relation"
            actions={actions}
            modal={false}
            open={this.state.messRelationDialogOpen}
            onRequestClose={this.handleMessDialogClose}
          >
            <TextField
              style={{
                margin: '0px 20px',
              }}
              hintText="Message"
              value={this.state.messaRelation}
              onChange={this.handleTextChange}
            />
          </Dialog>
        </div>
      );
    }
    return null;
  }
  render() {
    if (!this.state.loading) {
      // if the spotify checkbox is checked,
      // we only display the component if it has been found in the database
      if (!this.props.spotifyChecked || this.state.existInDatabase) {
        return (
          <Card style={this.state.style}>
            <CardMedia
              overlay={this.renderOverlay()}
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
