const express = require('express');
const session = require('express-session')
const app = express();
const OAuth1Client = require('oauth-1-client');
const appendQuery = require('append-query')
const JWT = require('jsonwebtoken');

const AuthMiddleware = require('./auth-middleware');

const port = 3000;
const baseURL = 'http://localhost:3000';


let oauthClient = new OAuth1Client({
    key: 'bqLkST63ZqSqqp0EH5eeg',
    secret: 'oFThG5O4RCEFsXazRm0KlcyZv6XGKIOxxOcJIx2Qow',
    callbackURL: `${baseURL}/oauth/callback`,
    requestUrl: 'http://www.goodreads.com/oauth/request_token',
    accessUrl: 'http://www.goodreads.com/oauth/access_token',
    apiHostName: 'http://www.goodreads.com'
});
let jwtSecret = 'this is a temp secret key';


app.use(session({
  secret: 'mysessionsecret',
  resave: false,
  saveUninitialized: true
}))

app.use(AuthMiddleware)



app.get('/', (req, res) => {
    res.send('Reading List Library Helper - Backend API');
});

app.get('/oauth/?', (req, res) => {
    let client_callback_url = null;
    if(!('callback_url' in req.query)){
        res.status(400).send('No callback url specified');
        return;
    } else {
        client_callback_url = req.query.callback_url;
    }

    oauthClient.requestToken()
        .then((request_token) => {

            req.session.request_token = request_token.token
            req.session.request_token_secret = request_token.tokenSecret
            req.session.client_callback_url = client_callback_url

            // var tempCredentials = {
            //     token: request_token.token,
            //     tokenSecret: request_token.tokenSecret
            // };

            const authUrl = `https://www.goodreads.com/oauth/authorize?oauth_token=${request_token.token}&oauth_callback=${oauthClient.callbackURL}`
            res.redirect(authUrl);
            return;
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Something broke!')
            return;
        });
});

app.get('/oauth/callback/?', (req, res) => {
    if(!('oauth_token' in req.query)){
        console.log('No oauth token received from goodreads')
        res.status(400).send('No oauth token received from goodreads');
        return;
    }
    if(!('client_callback_url' in req.session)){
        console.log('No callback url specified')
        res.status(400).send('No callback url specified');
        return;
    }
    if(!('request_token' in req.session) || !('request_token_secret' in req.session)){
        console.log('Could not find the original request token')
        res.status(400).send('Could not find the original request token');
        return;
    }

    // get the req token that was saved in the session
    let requestToken = req.session.request_token;
    let requestTokenSecret = req.session.request_token_secret;

    // get the verifier from goodreads
    let verifier = req.query.oauth_token;

    // remove the request token and callback from the session
    delete req.session.token;
    delete req.session.tokenSecret;
    delete req.session.client_callback_url;

    // get an access token from the request token and the verifier
    oauthClient.accessToken(requestToken, requestTokenSecret, verifier)
        .then((response) => {
            var accessToken = {
                token: response.token,
                tokenSecret: response.tokenSecret
            };

            // create a JWT with the access token for the client
            var jwt = JWT.sign(accessToken, jwtSecret);

            // add jwt to callback url
            let redirectUrl = req.session.client_callback_url;
            redirectUrl = appendQuery(redirectUrl, { jwt: jwt })

            // redirect back to the API client with the jwt
            res.redirect(redirectUrl);
            return;
        })
        .catch((err) => {
            console.log(`Error exchanging req token for access token: ${JSON.stringify(err)}`);
            res.status(500).send(`Unable to get access token: ${err}`)
            return;
        });
});

app.get('/api/?', (req, res) => {
    
});

app.get('/api/shelves/?', (req, res) => {
    
});

app.get('/api/shelves/:name/?', (req, res) => {
    let shelfName = req.params.name;
});

module.exports = app.listen(port, () => {
    console.log('API Server listening on port 3000');
});