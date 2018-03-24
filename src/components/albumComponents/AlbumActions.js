import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

export default class AlbumActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messRelationDialogOpen: false,
      messaRelation: '',
    };
    this.renderAddRelationshipButton = this.renderAddRelationshipButton.bind(this);
    this.handleMessDialogOpen = this.handleMessDialogOpen.bind(this);
    this.handleMessDialogClose = this.handleMessDialogClose.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
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
  renderAddRelationshipButton() {
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
          this.props.addRelationship(this.props.id, this.state.messaRelation);
          return this.handleMessDialogClose();
        }}
      />,
    ];
    return (
      <div>
        <FlatButton
          label="add as a relationship"
          onClick={this.handleMessDialogOpen}
        />
        <Dialog
          title="Entrez le message de la relation"
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
  render() {
    // in this first case, the album is searched in the context of management
    if (this.props.hasBeenSearched && this.props.isUnderManagement) {
      if (this.props.existInDatabase) {
        return this.renderAddRelationshipButton();
      }
      return <FlatButton label="Add to DB" onClick={this.props.addAlbumToNeo4J} />;
    } else if (this.props.hasBeenSearched) {
      // in this case, the album is searched in the context of search
      // we display the appropriate value depending on the presence of the album in the database
      if (this.props.existInDatabase) {
        return (
          <Link to={`/album/${this.props.id}`}>
            <FlatButton label="Manage" />
          </Link>

        );
      }
      return <FlatButton label="Add to DB" onClick={this.props.addAlbumToNeo4J} />;
    }
    // base case, we just wand to display the album information for the sake of it
    return null;
  }
}

AlbumActions.propTypes = {
  hasBeenSearched: PropTypes.bool.isRequired,
  isUnderManagement: PropTypes.bool.isRequired,
  existInDatabase: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  addRelationship: PropTypes.func.isRequired,
  addAlbumToNeo4J: PropTypes.func.isRequired,
};
