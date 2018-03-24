import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Album from './albumComponents/Album';

const style = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  width: '100vw',
};

export default class ResultsContainer extends Component {
  constructor(props) {
    super(props);
    this.renderResults = this.renderResults.bind(this);
  }
  renderResults = () => {
    if (this.props.type === 'album') {
      return this.props.results.map(album =>
        (<Album
          key={album.id}
          id={album.id}
          spotifyChecked={this.props.spotifyChecked}
          hasBeenSearched
          isUnderManagement={this.props.isUnderManagement}
          addRelationship={this.props.addRelationship}
        />));
    }
    return null;
  }
  render() {
    return (
      <div >
        <h1>{this.props.title}</h1>
        <div style={style}>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}

ResultsContainer.defaultProps = {
  addRelationship: () => null,
};

ResultsContainer.propTypes = {
  title: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  spotifyChecked: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  isUnderManagement: PropTypes.bool.isRequired,
  addRelationship: PropTypes.func,
};
