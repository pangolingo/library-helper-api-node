const JWT = require('jsonwebtoken');
const OAuth1Client = require('oauth-1-client');
let jwtSecret = 'this is a temp secret key';

// warning: these are duplicated from index
const baseURL = 'http://localhost:3000';
let oauthClient = new OAuth1Client({
    key: 'bqLkST63ZqSqqp0EH5eeg',
    secret: 'oFThG5O4RCEFsXazRm0KlcyZv6XGKIOxxOcJIx2Qow',
    callbackURL: `${baseURL}/oauth/callback`,
    requestUrl: 'http://www.goodreads.com/oauth/request_token',
    accessUrl: 'http://www.goodreads.com/oauth/access_token',
    apiHostName: 'http://www.goodreads.com'
});

const AuthMiddleware = function(req, res, next) {

   if (  /^\/api.*$/.test(req.path) ) { 
     // require auth header
    if(!('authorization' in req.headers)){
        res.status(401).send('User not authenticated');
        return;
    }
    jwt = req.headers.authorization.replace('Bearer ', '')



    // decode the JWT
    try {
        let decodedJWT = JWT.verify(jwt, jwtSecret);
    } catch(e) {
        res.status(401).send('Unable to decode JWT');
        return;
    }


    var clientAccessToken = {
        token: decodedJWT.token,
        tokenSecret: decodedJWT.tokenSecret
    };

    if(!clientAccessToken.token || !clientAccessToken.tokenSecret){
        res.status(401).send('User not authenticated');
        return;
    }

    // build access token from JWT access token info
    var authorizedOauthClient = oauthClient.auth(clientAccessToken.token, clientAccessToken.tokenSecret);

    // set the authorized client on the request
    res.set('authOauthClient', authorizedOauthClient);
   }

   // keep executing the router middleware
   next()
}

module.exports = AuthMiddleware