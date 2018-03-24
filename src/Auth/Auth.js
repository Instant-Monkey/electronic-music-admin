import auth0 from 'auth0-js';
import config from '../config';

export default class Auth {
  auth0 = new auth0.WebAuth(config.auth0);
  login() {
    this.auth0.authorize();
  }
  isAuthenticated(callback) {
    this.auth0.checkSession({
      audience: config.auth0.audience,
      scope: 'read:order write:order',
    }, (err, authResult) => {
      if (err) {
        callback(null);
      } else {
        callback(authResult);
      }
    });
  }
}
