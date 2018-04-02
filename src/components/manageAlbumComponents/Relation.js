import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Album from '../albumComponents/Album';
import apiKey from '../../apiAuthentificate';

export default class Relation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      relationMessage: props.relation.relProp.message,
    };
    this.editRelationshipMessage = this.editRelationshipMessage.bind(this);
  }
  editRelationshipMessage(targetId, newMessage) {
    const { originId } = this.props.relation;
    const body = {
      origin: originId,
      target: targetId,
      newMessage,
    };
    fetch(`${process.env.REACT_APP_API_URL}/albums/update-relationship-message`, {
      method: 'POST',
      headers: new Headers(apiKey()),
      body: JSON.stringify(body),
    }).then(res => res.json())
      .then(({ message }) => this.setState({ relationMessage: message }));
  }
  render() {
    return (
      <div className="relation-container">
        <Album
          id={this.props.relation.properties._id}
          overlayTitle={this.state.relationMessage}
          width="100%"
          hasBeenSearched
          editRelationshipMessage={this.editRelationshipMessage}
        />
      </div>
    );
  }
}

Relation.propTypes = {
  relation: PropTypes.object.isRequired,
};
