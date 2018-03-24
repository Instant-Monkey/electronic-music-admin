// this is where you set everything upp

const config = {
  auth0: {
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    clientID: process.env.REACT_APP_AUTH_ID,
    redirectUri: process.env.REACT_APP_AUTH_REDIRECT,
    audience: process.env.REACT_APP_AUTH_AUDIENCE,
    responseType: 'token id_token',
    scope: 'openid',
  },
  admin: {
    id: process.env.REACT_APP_AUTH_ADMINID,
  },
  credentials: {
    password: process.env.REACT_APP_CLIENT_CRED,
    key: process.env.REACT_APP_KEY_CRYPT,
  },
};

module.exports = config;
