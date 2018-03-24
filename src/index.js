import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import ManageAlbum from './components/manageAlbumComponents/ManageAlbum';
import Auth from './Auth/Auth';
import { admin } from './config';


const auth = new Auth();
auth.isAuthenticated((result) => {
  if (result == null || result.idTokenPayload.sub !== admin.id) {
    auth.login();
  } else {
    ReactDOM.render(
      <Router>
        <MuiThemeProvider>
          <div>
            <Route exact path="/" component={App} />
            <Route path="/album/:id" component={ManageAlbum} />
          </div>
        </MuiThemeProvider>
      </Router>,
      document.getElementById('root'),
    );
    registerServiceWorker();
  }
});
