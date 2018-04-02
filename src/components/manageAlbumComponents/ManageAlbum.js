import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import ActionHome from 'material-ui/svg-icons/action/home';

import Album from '../albumComponents/Album';
import SearchWrapper from '../SearchWrapper';
import Relation from './Relation';
import apiKey from '../../apiAuthentificate';

export default class ManageAlbum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      found: false,
      loading: true,
      relations: [],
      currentId: this.props.match.params.id,
    };
    this.addRelationship = this.addRelationship.bind(this);
    this.renderRelations = this.renderRelations.bind(this);
    this.getRelationShips = this.getRelationShips.bind(this);
    this.updateItself = this.updateItself.bind(this);
  }
  componentDidMount() {
    this.updateItself();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ currentId: nextProps.match.params.id }, () => this.updateItself());
  }
  getRelationShips() {
    const related = new Promise((resolve, reject) => {
      fetch(`${process.env.REACT_APP_API_URL}/albums/related/${this.state.currentId}`, {
        method: 'GET',
        headers: new Headers(apiKey()),
      })
        .then(res => res.json())
        .then((results) => {
          const onlyFields = results.map(relation => relation._fields[0]);
          resolve(onlyFields);
        })
        .catch(err => reject(err));
    });

    const relationships = new Promise((resolve, reject) => {
      fetch(`${process.env.REACT_APP_API_URL}/albums/relationships/${this.state.currentId}`, {
        method: 'GET',
        headers: new Headers(apiKey()),
      })
        .then(res => res.json())
        .then((results) => {
          const messageArray = results.map(relationship => relationship._fields[0]);
          resolve(messageArray);
        })
        .catch(err => reject(err));
    });

    Promise.all([related, relationships]).then((values) => {
      const relatedNodes = values[0];
      const relationshipsToNodes = values[1];
      const fullRelationObject = relatedNodes.map((rel) => {
        // we find the relationship linked to the related node
        const relationship = relationshipsToNodes.find(relN => relN.end.low === rel.identity.low);
        // we merge the two object
        return Object.assign({ relType: relationship.type, relProp: relationship.properties, originId: this.state.currentId }, rel);
      });
      this.setState({
        relations: fullRelationObject,
      });
    });
  }
  updateItself() {
    fetch(`${process.env.REACT_APP_API_URL}/albums/${this.state.currentId}`, {
      method: 'GET',
      headers: new Headers(apiKey()),
    })
      .then(res => res.json())
      .then(dbAlbumInfo => this.setState({
        found: !_.isEmpty(dbAlbumInfo),
        loading: false,
      }));
    this.getRelationShips();
  }
  addRelationship(targetId, message) {
    const property = {
      source: {
        label: 'Album',
        _id: this.props.match.params.id,
      },
      target: {
        label: 'Album',
        _id: targetId,
      },
      rel: {
        type: 'ALBUM_RECO',
        message,
      },
    };
    fetch(`${process.env.REACT_APP_API_URL}/albums/add-album-relationship`, {
      method: 'POST',
      headers: new Headers(apiKey()),
      body: JSON.stringify(property),
    }).then(res => res.json())
      .then((newRelation) => {
        this.getRelationShips();
        console.log('relation created:', newRelation);
      });
  }
  renderRelations() {
    if (this.state.relations.length > 0) {
      return this.state.relations.map(relation =>
        (<Relation
          key={`${relation.identity.low}`}
          relation={relation}
        />));
    }
    return null;
  }
  render() {
    if (this.state.found) {
      return (
        <div>
          <Link to="/">
            <IconButton tooltip="Back home">
              <ActionHome />
            </IconButton>
          </Link>
          <div className="manage-album-container">
            <Album
              id={this.state.currentId}
              isUnderManagement
            />
            <div className="relations-container">
              {this.renderRelations()}
            </div>
          </div>
          <SearchWrapper isUnderManagement addRelationship={this.addRelationship} />
        </div>
      );
    }
    if (!this.state.loading) {
      return <h1> Pas d\'album trouvé :(</h1>;
    }
    return null;
  }
}
/*
Album.propTypes = {
  album: PropTypes.isRequired,
};*/
