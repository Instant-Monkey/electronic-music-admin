import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Album from '../albumComponents/Album';

export default class Relation extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div className="relation-container">
        <Album
          id={this.props.relation.properties._id}
          overlayTitle={this.props.relation.relProp.message}
          width="100%"
          hasBeenSearched

        />
      </div>
    );
  }
}

Relation.propTypes = {
  relation: PropTypes.object.isRequired,
};
